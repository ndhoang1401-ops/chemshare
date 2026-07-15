import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import { categorySchema } from "@/lib/validators/admin";
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
  const body = await request.json().catch(() => null);
  // Không cho đổi slug qua form sửa — slug đã có thể nằm trong URL đã
  // chia sẻ (vd. /search?category=...); chỉ cho sửa tên/ký hiệu/nhóm.
  const parsed = categorySchema.omit({ slug: true }).safeParse(body);
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
    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ ok: true, category });
  } catch (error) {
    console.error("[api/admin/categories/update]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { documents: true } } },
    });
    if (!category) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (category._count.documents > 0) {
      return NextResponse.json(
        { error: "category_in_use", count: category._count.documents },
        { status: 409 },
      );
    }

    await prisma.category.delete({ where: { id } });

    await logActivity({
      userId: session.user.id,
      action: "category.delete",
      targetType: "category",
      targetId: id,
      metadata: { name: category.name },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/categories/delete]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
