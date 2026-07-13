import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prisma 7 bỏ engine kết nối nội bộ — PrismaClient bắt buộc phải nhận một
// driver adapter, không còn tự đọc "url" từ schema.prisma nữa (xem
// NEXTJS_NOTES.md mục "Prisma 7"). Ta tự tạo pool kết nối bằng `pg` rồi
// bọc qua @prisma/adapter-pg.
//
// Next.js dev server hot-reload sẽ chạy lại module mỗi lần sửa file — nếu
// khởi tạo lại pool/PrismaClient trực tiếp sẽ tạo hàng loạt kết nối DB mới
// và nhanh chóng vượt giới hạn connection pool của Postgres. Lưu cả hai
// vào `globalThis` để tái sử dụng giữa các lần reload (chỉ ở dev).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "Thiếu biến môi trường DATABASE_URL — kiểm tra file .env (xem .env.example).",
  );
}

// Postgres chạy local (Docker) không cần SSL; Postgres trên mây (Neon,
// Supabase...) cần SSL nhưng thường dùng chứng chỉ mà Node không tự xác
// thực được — bật `rejectUnauthorized: false` cho các kết nối không phải
// localhost, đây là cấu hình phổ biến cho ứng dụng cá nhân/học tập.
const isLocalDb =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

/**
 * Bỏ tham số `sslmode` khỏi connection string trước khi đưa cho `pg`.
 * Lý do: `pg-connection-string` tự parse `sslmode` trong URL và in cảnh
 * báo SECURITY WARNING với các giá trị "prefer"/"require"/"verify-ca" (vì
 * hành vi này sẽ đổi ở bản sau) — cảnh báo này in ra ngay cả khi ta ĐÃ
 * truyền `ssl` tường minh bên dưới để tự quyết định, nên tốt nhất là
 * không để `pg` thấy `sslmode` trong URL nữa, tránh nhiễu console.
 */
function stripSslModeParam(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("sslmode");
    return parsed.toString();
  } catch {
    return url;
  }
}

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: stripSslModeParam(connectionString),
    ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
