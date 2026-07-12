// Next.js 16 đổi tên quy ước `middleware.ts` → `proxy.ts` (xem
// NEXTJS_NOTES.md). Toàn bộ logic phân quyền nằm trong callback
// `authorized` ở src/auth.config.ts. Runtime của proxy luôn là nodejs nên
// import thẳng `@/auth` (có Prisma + Argon2) là an toàn.
//
// Lưu ý: `export { auth as default } from "@/auth"` KHÔNG được Next.js
// nhận diện là default export hợp lệ cho proxy.ts (lỗi "must export a
// function"). Phải import rồi export default tường minh như dưới đây.
import { auth } from "@/auth";

export default auth;

export const config = {
  matcher: [
    "/profile/:path*",
    "/upload/:path*",
    "/my-documents/:path*",
    "/notifications/:path*",
    "/admin/:path*",
  ],
};
