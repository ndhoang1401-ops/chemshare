import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireReviewer } from "@/lib/auth-guards";
import { USER_ROLES } from "@/lib/constants";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { DocumentDeleteButton } from "@/components/admin/document-delete-button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quản lý tài liệu",
};

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
] as const;

interface AdminDocumentsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminDocumentsPage({
  searchParams,
}: AdminDocumentsPageProps) {
  const session = await requireReviewer();
  const isAdmin = session.user.role === USER_ROLES.ADMIN;

  const { status } = await searchParams;
  const validStatus = STATUS_TABS.some((t) => t.value === status) ? status : "";

  const documents = await prisma.document.findMany({
    where: validStatus ? { status: validStatus as never } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      category: { select: { name: true } },
      uploader: { select: { displayName: true, email: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-semibold">
        Quản lý tài liệu
      </h1>
      <p className="text-ink-soft mb-6 text-sm">
        {documents.length} tài liệu{validStatus ? " (đã lọc)" : ""}.
      </p>

      <div className="border-line mb-6 flex gap-1 border-b">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value
                ? `/admin/documents?status=${tab.value}`
                : "/admin/documents"
            }
            className={cn(
              "border-b-2 px-3 py-2 text-sm",
              validStatus === tab.value
                ? "border-flame text-flame"
                : "text-ink-soft hover:text-flame border-transparent",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {documents.length === 0 ? (
        <p className="border-line text-ink-soft rounded-[var(--radius-tile)] border border-dashed px-4 py-8 text-center text-sm">
          Không có tài liệu nào.
        </p>
      ) : (
        <ul className="divide-line border-line divide-y rounded-[var(--radius-tile)] border">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/documents/${doc.slug}`}
                  className="text-ink hover:text-flame truncate text-sm font-medium"
                >
                  {doc.title}
                </Link>
                <p className="text-ink-soft mt-0.5 truncate font-mono text-xs">
                  {doc.category.name} · {doc.uploader.displayName} ·{" "}
                  {doc.viewCount} xem · {doc.downloadCount} tải
                </p>
              </div>
              <DocumentStatusBadge status={doc.status} />
              {isAdmin && (
                <DocumentDeleteButton documentId={doc.id} title={doc.title} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
