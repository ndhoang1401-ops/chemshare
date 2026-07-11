import { PrismaClient } from "@prisma/client";

// Next.js dev server hot-reload sẽ chạy lại module mỗi lần sửa file — nếu
// khởi tạo PrismaClient trực tiếp sẽ tạo hàng loạt kết nối DB mới và nhanh
// chóng vượt giới hạn connection pool của Postgres. Lưu instance vào
// `globalThis` để tái sử dụng giữa các lần reload (chỉ ở dev).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
