import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7 + pg dùng native/binary bindings — để Turbopack/webpack tải
  // trực tiếp từ node_modules lúc chạy thay vì cố bundle vào, tránh lỗi
  // "Cannot find module '.prisma/client/default'". Xem NEXTJS_NOTES.md
  // mục "Prisma 7".
  serverExternalPackages: ["@prisma/client", "pg"],
  turbopack: {
    resolveAlias: {
      ".prisma/client/default": "./node_modules/.prisma/client/default.js",
    },
  },
};

export default nextConfig;
