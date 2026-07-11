import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validators/auth";
import { createVerificationToken } from "@/lib/tokens";
import { sendMail, buildVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation_error",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password, displayName } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Khác với forgot-password, ở bước đăng ký việc báo "email đã tồn
      // tại" là UX tiêu chuẩn và rủi ro lộ thông tin thấp hơn nhiều.
      return NextResponse.json(
        { error: "email_taken", message: "Email này đã được đăng ký." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, displayName },
    });

    const token = await createVerificationToken(user.id, "EMAIL_VERIFICATION");
    const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    const { subject, text, html } = buildVerificationEmail(
      user.displayName,
      verifyUrl,
    );
    await sendMail({ to: user.email, subject, text, html });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    // Phòng trường hợp race condition: 2 request đăng ký cùng email gần
    // như đồng thời vượt qua findUnique trước khi create() xảy ra.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "email_taken", message: "Email này đã được đăng ký." },
        { status: 409 },
      );
    }
    console.error("[api/auth/register]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
