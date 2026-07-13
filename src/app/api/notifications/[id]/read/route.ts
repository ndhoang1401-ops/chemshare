import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // updateMany + where userId để đảm bảo chỉ chủ sở hữu mới đánh dấu
    // được thông báo của chính mình (thay vì findUnique rồi so sánh, để
    // tránh 2 round-trip và tránh lộ việc thông báo có tồn tại hay không
    // nếu nó thuộc về người khác).
    const result = await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { isRead: true },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/notifications/read]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
