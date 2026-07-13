// Next.js 16 đổi tên quy ước `middleware.ts` → `proxy.ts` (xem
// NEXTJS_NOTES.md mục 1). Toàn bộ logic phân quyền nằm trong callback
// `authorized` ở src/auth.config.ts.
//
// QUAN TRỌNG: KHÔNG import "@/auth" (bản đầy đủ) ở đây, dù runtime của
// proxy là nodejs. Next.js/Turbopack đóng gói proxy.ts thành một bundle
// riêng biệt, và bundle đó không nhét được native addon (vd.
// @node-rs/argon2 mà auth.ts dùng để hash mật khẩu) vào — gây lỗi build
// "Export auth doesn't exist in target module". Xem NEXTJS_NOTES.md mục
// 11 để biết chi tiết.
//
// Cách đúng: tạo một instance NextAuth() RIÊNG, nhẹ, chỉ dùng
// auth.config.ts (không có Credentials provider, không đụng Prisma/
// Argon2/nodemailer) — instance này chỉ cần đọc/giải mã JWT sẵn có để
// biết ai đang đăng nhập, không cần biết provider nào cả. Đây là pattern
// chính thức của Auth.js v5 cho middleware.
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

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
