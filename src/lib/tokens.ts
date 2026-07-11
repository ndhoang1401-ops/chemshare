import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { TokenType } from "@prisma/client";

const TOKEN_TTL_MS: Record<TokenType, number> = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 giờ
  PASSWORD_RESET: 60 * 60 * 1000, // 1 giờ
};

/**
 * Tạo token ngẫu nhiên cho một loại xác thực, xoá các token cùng loại
 * chưa dùng trước đó của user (mỗi user chỉ có tối đa 1 token hiệu lực
 * mỗi loại tại một thời điểm, tránh tích tụ token rác + tránh token cũ
 * vẫn còn dùng được sau khi user yêu cầu gửi lại email).
 */
export async function createVerificationToken(userId: string, type: TokenType) {
  await prisma.verificationToken.deleteMany({ where: { userId, type } });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS[type]);

  await prisma.verificationToken.create({
    data: { userId, token, type, expiresAt },
  });

  return token;
}

/**
 * Xác thực + "tiêu thụ" (xoá) một token. Trả về userId nếu hợp lệ, hoặc
 * một mã lỗi để tầng gọi hiển thị thông báo phù hợp.
 */
export async function consumeVerificationToken(
  token: string,
  type: TokenType,
): Promise<
  { ok: true; userId: string } | { ok: false; reason: "not_found" | "expired" }
> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.type !== type) {
    return { ok: false, reason: "not_found" };
  }

  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return { ok: false, reason: "expired" };
  }

  await prisma.verificationToken.delete({ where: { id: record.id } });
  return { ok: true, userId: record.userId };
}
