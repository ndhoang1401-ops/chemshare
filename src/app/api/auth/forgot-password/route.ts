import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { createVerificationToken } from "@/lib/tokens";
import { sendMail, buildPasswordResetEmail } from "@/lib/email";
import { getClientIp, rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(
    `forgot-password:${ip}`,
    RATE_LIMITS.forgotPassword,
  );
  if (!limited.allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Bạn đã yêu cầu quá nhiều lần, vui lòng thử lại sau.",
        retryAfterSeconds: limited.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation_error",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    // Luôn trả về cùng một phản hồi bất kể email có tồn tại trong hệ
    // thống hay không — tránh lộ thông tin tài khoản nào đã đăng ký.
    if (user) {
      const token = await createVerificationToken(user.id, "PASSWORD_RESET");
      const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
      const { subject, text, html } = buildPasswordResetEmail(
        user.displayName,
        resetUrl,
      );
      await sendMail({ to: user.email, subject, text, html });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/auth/forgot-password]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
