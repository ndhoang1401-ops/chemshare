// Bắt buộc từ Prisma 7 — trước đây "url" nằm trong prisma/schema.prisma,
// giờ Prisma CLI (generate/migrate/studio/seed) đọc connection string và
// cấu hình migration từ file này thay vì từ schema. Xem NEXTJS_NOTES.md
// mục "Prisma 7" để biết chi tiết vì sao có file này.
//
// QUAN TRỌNG: dùng DIRECT_URL (không qua pooler PgBouncer của Neon) ở
// đây, KHÁC với DATABASE_URL (pooled) mà lib/prisma.ts dùng cho app chạy
// thật. PgBouncer chế độ transaction (Neon dùng mặc định) không hỗ trợ
// DDL (CREATE TABLE/ALTER TABLE...) mà `prisma migrate deploy` cần —
// dùng nhầm URL pooled ở đây làm lệnh migrate lỗi/treo khi build trên
// Vercel. Đã xác nhận qua tài liệu chính thức Prisma (hướng dẫn nâng cấp
// lên v7: "pass the directUrl value in the url field of prisma.config.ts
// instead"). Xem NEXTJS_NOTES.md mục 19.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
