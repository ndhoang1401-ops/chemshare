import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { consumeVerificationToken } from "@/lib/tokens";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);

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
    const result = await consumeVerificationToken(
      parsed.data.token,
      "PASSWORD_RESET",
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await prisma.user.update({
      where: { id: result.userId },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/auth/reset-password]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
