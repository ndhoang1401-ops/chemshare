import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/storage";
import {
  ApprovalActionRow,
  type PendingDocument,
} from "@/components/admin/approval-action-row";

export const metadata: Metadata = {
  title: "Hàng chờ phê duyệt",
};

export default async function ApprovalsPage() {
  // Layout (admin) đã kiểm tra vai trò, nhưng vẫn cần session để không
  // truy vấn thừa nếu vì lý do gì đó chạy tới đây mà chưa có session.
  const session = await auth();
  if (!session?.user) return null;

  const pending = await prisma.document.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      category: { select: { name: true } },
      uploader: { select: { displayName: true, email: true } },
    },
  });

  const documents: PendingDocument[] = await Promise.all(
    pending.map(async (doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      keywords: doc.keywords,
      author: doc.author,
      grade: doc.grade,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      createdAt: doc.createdAt.toISOString(),
      category: doc.category,
      uploader: doc.uploader,
      previewHref: await getDownloadUrl(doc.fileUrl),
    })),
  );

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-semibold">
        Hàng chờ phê duyệt
      </h1>
      <p className="text-ink-soft mb-8 text-sm">
        {documents.length === 0
          ? "Không có tài liệu nào đang chờ duyệt."
          : `${documents.length} tài liệu đang chờ duyệt.`}
      </p>

      {documents.length > 0 && (
        <ul className="space-y-4">
          {documents.map((doc) => (
            <ApprovalActionRow key={doc.id} doc={doc} />
          ))}
        </ul>
      )}
    </div>
  );
}
