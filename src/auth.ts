import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validators/auth";

/**
 * Auth.js chỉ hiển thị `code` (không phải message) lên URL redirect khi
 * đăng nhập thất bại — không được hé lộ thông tin nhạy cảm. Hai mã dưới
 * đây được LoginForm (Giai đoạn 2) dịch sang tiếng Việt phù hợp.
 */
class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          throw new InvalidCredentialsError();
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) {
          // Cố ý dùng chung lỗi với "sai mật khẩu" để tránh lộ việc email
          // có tồn tại trong hệ thống hay không.
          throw new InvalidCredentialsError();
        }

        const passwordMatches = await verifyPassword(
          user.passwordHash,
          parsed.data.password,
        );
        if (!passwordMatches) {
          throw new InvalidCredentialsError();
        }

        if (!user.emailVerifiedAt) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
});
