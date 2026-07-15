import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import { categorySchema } from "@/lib/validators/admin";
import { USER_ROLES } from "@/lib/constants";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
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
    const category = await prisma.category.create({ data: parsed.data });

    await logActivity({
      userId: session.user.id,
      action: "category.create",
      targetType: "category",
      targetId: category.id,
      metadata: { name: category.name },
    });

    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "validation_error",
          fieldErrors: { slug: ["Slug này đã tồn tại"] },
        },
        { status: 409 },
      );
    }
    console.error("[api/admin/categories]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
