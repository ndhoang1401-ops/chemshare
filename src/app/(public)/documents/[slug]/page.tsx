import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye, Download as DownloadIcon } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/storage";
import { GRADE_LABELS, USER_ROLES } from "@/lib/constants";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { DocumentCard } from "@/components/documents/document-card";
import { DownloadButton } from "@/components/documents/download-button";

const REVIEWER_ROLES: string[] = [USER_ROLES.MODERATOR, USER_ROLES.ADMIN];

interface DocumentPageProps {
  params: Promise<{ slug: string }>;
}

// React.cache() giúp generateMetadata và component trang dùng chung 1
// lượt truy vấn thay vì gọi Prisma 2 lần cho cùng 1 request.
const getDocumentBySlug = cache(async (slug: string) => {
  return prisma.document.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      uploader: { select: { id: true, displayName: true } },
    },
  });
});

export async function generateMetadata({
  params,
}: DocumentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);
  if (!document) return {};
  return {
    title: document.title,
    description: document.description ?? undefined,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DocumentDetailPage({
  params,
}: DocumentPageProps) {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);
  if (!document) notFound();

  const session = await auth();
  const isOwner = session?.user?.id === document.uploaderId;
  const isReviewer =
    !!session?.user && REVIEWER_ROLES.includes(session.user.role);
  const canView = document.status === "APPROVED" || isOwner || isReviewer;

  // Tài liệu chưa duyệt không công khai — trả 404 thay vì 403 để không
  // lộ sự tồn tại của tài liệu cho người không liên quan.
  if (!canView) notFound();

  // Tăng lượt xem — không chặn render nếu lỗi (vd. duyệt trùng lúc DB bận).
  await prisma.document
    .update({
      where: { id: document.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  const isPdf = document.fileType === "application/pdf";
  const previewUrl = isPdf ? await getDownloadUrl(document.fileUrl) : null;

  const related = await prisma.document.findMany({
    where: {
      status: "APPROVED",
      categoryId: document.categoryId,
      id: { not: document.id },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      category: { select: { name: true, slug: true } },
      uploader: { select: { displayName: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {document.status !== "APPROVED" && (
        <div className="border-amber/30 bg-amber/5 text-amber mb-6 rounded-[var(--radius-tile)] border px-4 py-3 text-sm">
          Tài liệu này chưa được duyệt, chỉ bạn và kiểm duyệt viên xem được.{" "}
          <DocumentStatusBadge status={document.status} />
        </div>
      )}

      <p className="text-ink-soft font-mono text-xs">
        <Link
          href={`/search?category=${document.category.slug}`}
          className="hover:text-flame"
        >
          {document.category.name}
        </Link>
        {document.grade && ` · ${GRADE_LABELS[document.grade]}`}
      </p>

      <h1 className="font-display mt-2 text-2xl font-semibold text-balance sm:text-3xl">
        {document.title}
      </h1>

      <div className="text-ink-soft mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span>
          Đăng bởi{" "}
          <span className="text-ink">{document.uploader.displayName}</span>
        </span>
        <span>
          {document.createdAt.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" /> {document.viewCount}
        </span>
        <span className="flex items-center gap-1">
          <DownloadIcon className="h-3.5 w-3.5" /> {document.downloadCount}
        </span>
      </div>

      {document.author && (
        <p className="text-ink-soft mt-1 text-sm">Tác giả: {document.author}</p>
      )}

      {document.description && (
        <p className="text-ink mt-4 text-sm leading-relaxed">
          {document.description}
        </p>
      )}

      {document.keywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {document.keywords.map((keyword) => (
            <Link
              key={keyword}
              href={`/search?q=${encodeURIComponent(keyword)}`}
              className="bg-paper-raised text-ink-soft hover:text-flame rounded-[var(--radius-tile)] px-2 py-0.5 font-mono text-[11px]"
            >
              {keyword}
            </Link>
          ))}
        </div>
      )}

      <div className="border-line bg-paper-raised mt-6 flex flex-wrap items-center gap-4 rounded-[var(--radius-tile)] border p-4">
        <div className="text-ink-soft text-sm">
          <p className="text-ink">{document.fileName}</p>
          <p className="mt-0.5 font-mono text-xs">
            {document.fileType.split("/").pop()?.toUpperCase()} ·{" "}
            {formatFileSize(document.fileSize)}
          </p>
        </div>
        <div className="ml-auto">
          <DownloadButton
            documentId={document.id}
            isLoggedIn={!!session?.user}
          />
        </div>
      </div>

      {isPdf && previewUrl && (
        <div className="mt-6">
          <h2 className="font-display mb-2 text-base font-semibold">
            Xem trước
          </h2>
          <iframe
            src={previewUrl}
            title={document.title}
            className="border-line h-[600px] w-full rounded-[var(--radius-tile)] border"
          />
        </div>
      )}
      {!isPdf && (
        <p className="border-line text-ink-soft mt-6 rounded-[var(--radius-tile)] border border-dashed px-4 py-6 text-center text-sm">
          Chưa hỗ trợ xem trước cho file{" "}
          {document.fileType.includes("word") ? "DOCX" : "PPTX"} — tải xuống để
          xem toàn bộ nội dung.
        </p>
      )}

      {related.length > 0 && (
        <div className="border-line mt-10 border-t pt-8">
          <h2 className="font-display mb-4 text-lg font-semibold">
            Tài liệu liên quan
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
