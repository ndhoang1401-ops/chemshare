import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/tokens";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : null;

  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  try {
    const result = await consumeVerificationToken(token, "EMAIL_VERIFICATION");

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: result.userId },
      data: { emailVerifiedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/auth/verify-email]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
