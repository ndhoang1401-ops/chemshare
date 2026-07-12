// Bắt buộc từ Prisma 7 — trước đây "url" nằm trong prisma/schema.prisma,
// giờ Prisma CLI (generate/migrate/studio/seed) đọc connection string và
// cấu hình migration từ file này thay vì từ schema. Xem NEXTJS_NOTES.md
// mục "Prisma 7" để biết chi tiết vì sao có file này.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
