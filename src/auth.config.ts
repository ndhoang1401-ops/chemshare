import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { USER_ROLES } from "@/lib/constants";

/**
 * Tách riêng phần cấu hình không đụng tới Prisma/Node API (theo khuyến
 * nghị chính thức của Auth.js) để có thể import an toàn ở nhiều nơi,
 * kể cả nơi không cần truy vấn DB. Provider Credentials (cần Prisma +
 * Argon2) được thêm vào ở auth.ts.
 */

const ADMIN_AREA_ROLES: string[] = [USER_ROLES.MODERATOR, USER_ROLES.ADMIN];

/** Yêu cầu đã đăng nhập (bất kỳ vai trò nào). */
const PROTECTED_PREFIXES = [
  "/profile",
  "/upload",
  "/my-documents",
  "/notifications",
];

/** Yêu cầu vai trò Moderator hoặc Admin. */
const ADMIN_PREFIX = "/admin";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      // `user` chỉ có giá trị ngay lúc đăng nhập thành công (từ
      // authorize() trong auth.ts) — gắn vào token để dùng lại về sau
      // mà không cần truy vấn DB ở mỗi request. authorize() luôn trả về
      // `id` thật từ Prisma nên ép kiểu string là an toàn ở đây; type
      // gốc của Auth.js để `id` optional vì còn dùng chung cho OAuth.
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    authorized({ request, auth }) {
      const { pathname, search } = request.nextUrl;
      const callbackUrl = encodeURIComponent(pathname + search);

      if (pathname.startsWith(ADMIN_PREFIX)) {
        if (!auth?.user) {
          return NextResponse.redirect(
            new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
          );
        }
        if (!ADMIN_AREA_ROLES.includes(auth.user.role)) {
          return NextResponse.redirect(new URL("/", request.url));
        }
        return true;
      }

      if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        if (!auth?.user) {
          return NextResponse.redirect(
            new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
          );
        }
        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
