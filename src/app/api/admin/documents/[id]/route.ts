import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { USER_ROLES } from "@/lib/constants";

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
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Xóa record trước (Review/Download tự xóa theo qua onDelete: Cascade
    // trong schema); nếu xóa file storage thất bại thì log lại nhưng
    // không rollback — record rác trong storage ít hại hơn record DB trỏ
    // tới file không xóa được.
    await prisma.document.delete({ where: { id } });

    await deleteFile(document.fileUrl).catch((error) => {
      console.error("[api/admin/documents/delete] xóa file thất bại", error);
    });

    await logActivity({
      userId: session.user.id,
      action: "document.delete",
      targetType: "document",
      targetId: id,
      metadata: { title: document.title },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/documents/delete]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
