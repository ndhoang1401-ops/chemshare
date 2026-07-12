import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validators/profile";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);

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
      where: { id: session.user.id },
    });
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const currentMatches = await verifyPassword(
      user.passwordHash,
      parsed.data.currentPassword,
    );
    if (!currentMatches) {
      return NextResponse.json(
        { error: "wrong_current_password" },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/profile/change-password]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
