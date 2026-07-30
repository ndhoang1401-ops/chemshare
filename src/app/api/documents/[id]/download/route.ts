import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/storage";
import { USER_ROLES } from "@/lib/constants";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const REVIEWER_ROLES: string[] = [USER_ROLES.MODERATOR, USER_ROLES.ADMIN];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(
    `download:${session.user.id}`,
    RATE_LIMITS.download,
  );
  if (!limited.allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Bạn tải xuống quá nhanh, vui lòng thử lại sau.",
        retryAfterSeconds: limited.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  const { id } = await params;

  try {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const canAccess =
      document.status === "APPROVED" ||
      document.uploaderId === session.user.id ||
      REVIEWER_ROLES.includes(session.user.role);

    if (!canAccess) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.document.update({
        where: { id: document.id },
        data: { downloadCount: { increment: 1 } },
      }),
      prisma.download.create({
        data: { documentId: document.id, userId: session.user.id },
      }),
    ]);

    const url = await getDownloadUrl(document.fileUrl);

    return NextResponse.json({ ok: true, url, fileName: document.fileName });
  } catch (error) {
    console.error("[api/documents/download]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
