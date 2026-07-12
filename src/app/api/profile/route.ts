import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validators/profile";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);

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
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: parsed.data.displayName,
        bio: parsed.data.bio || null,
        avatar: parsed.data.avatar || null,
      },
      select: {
        id: true,
        displayName: true,
        bio: true,
        avatar: true,
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("[api/profile]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
