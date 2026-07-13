import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import { reviewDocumentSchema } from "@/lib/validators/document";
import { USER_ROLES } from "@/lib/constants";

const REVIEWER_ROLES: string[] = [USER_ROLES.MODERATOR, USER_ROLES.ADMIN];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || !REVIEWER_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = reviewDocumentSchema.safeParse(body);

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
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (document.status !== "PENDING") {
      return NextResponse.json({ error: "already_reviewed" }, { status: 409 });
    }

    const { status, note } = parsed.data;

    const notificationContent =
      status === "APPROVED"
        ? `Tài liệu "${document.title}" của bạn đã được duyệt và hiện đã công khai trên hệ thống.`
        : `Tài liệu "${document.title}" của bạn đã bị từ chối. Lý do: ${note}`;

    await prisma.$transaction([
      prisma.review.create({
        data: {
          documentId: document.id,
          moderatorId: session.user.id,
          status,
          note: note || null,
        },
      }),
      prisma.document.update({
        where: { id: document.id },
        data: { status },
      }),
      prisma.notification.create({
        data: {
          userId: document.uploaderId,
          title:
            status === "APPROVED"
              ? "Tài liệu đã được duyệt"
              : "Tài liệu bị từ chối",
          content: notificationContent,
        },
      }),
    ]);

    await logActivity({
      userId: session.user.id,
      action: status === "APPROVED" ? "document.approve" : "document.reject",
      targetType: "document",
      targetId: document.id,
      metadata: note ? { note } : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/documents/review]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
