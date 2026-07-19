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

class AccountSuspendedError extends CredentialsSignin {
  code = "account_suspended";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    /**
     * Ghi đè jwt callback của auth.config.ts: giữ nguyên việc gán
     * id/role lúc đăng nhập, NHƯNG còn làm mới displayName/avatar/role
     * từ DB ở MỌI lần gọi (không chỉ lúc đăng nhập) — nếu không, sau khi
     * đổi tên/avatar ở trang hồ sơ, các nơi khác (nav, header...) vẫn
     * hiện giá trị cũ tới khi đăng xuất-đăng nhập lại, vì JWT session
     * không tự đồng bộ lại với DB.
     *
     * Đánh đổi: mỗi request cần session sẽ có thêm 1 query nhẹ
     * (findUnique theo id, có index) — chấp nhận được ở quy mô hiện tại.
     *
     * Lưu ý: callback này bắt buộc nằm ở auth.ts (không phải
     * auth.config.ts) vì cần Prisma — auth.config.ts phải giữ
     * edge/bundle-safe cho proxy.ts (xem NEXTJS_NOTES.md mục 11).
     */
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { displayName: true, avatar: true, role: true },
        });
        if (dbUser) {
          token.name = dbUser.displayName;
          token.picture = dbUser.avatar;
          token.role = dbUser.role;
        }
      }

      return token;
    },
  },
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

        if (!user.isActive) {
          throw new AccountSuspendedError();
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
