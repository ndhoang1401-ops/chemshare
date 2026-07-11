// Next.js 16 đổi tên quy ước `middleware.ts` → `proxy.ts` (xem
// NEXTJS_NOTES.md). Toàn bộ logic phân quyền nằm trong callback
// `authorized` ở src/auth.config.ts — proxy.ts chỉ cần export lại `auth`
// làm handler mặc định. Runtime của proxy luôn là nodejs nên import
// thẳng `@/auth` (có Prisma + Argon2) là an toàn, không có ràng buộc
// Edge runtime như middleware.ts trước đây.
export { auth as default } from "@/auth";

export const config = {
  matcher: [
    "/profile/:path*",
    "/upload/:path*",
    "/my-documents/:path*",
    "/notifications/:path*",
    "/admin/:path*",
  ],
};
