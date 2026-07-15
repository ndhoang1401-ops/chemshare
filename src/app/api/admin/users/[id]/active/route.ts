import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import { setActiveSchema } from "@/lib/validators/admin";
import { USER_ROLES } from "@/lib/constants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "cannot_change_self" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = setActiveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  try {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: parsed.data.isActive },
    });

    await logActivity({
      userId: session.user.id,
      action: parsed.data.isActive ? "user.unlock" : "user.lock",
      targetType: "user",
      targetId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/users/active]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
