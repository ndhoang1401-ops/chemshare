import Link from "next/link";
import { GRADE_LABELS } from "@/lib/constants";

export interface DocumentCardData {
  slug: string;
  title: string;
  description: string | null;
  grade: string | null;
  viewCount: number;
  downloadCount: number;
  category: { name: string };
  uploader: { displayName: string };
}

export function DocumentCard({
  document: doc,
}: {
  document: DocumentCardData;
}) {
  return (
    <Link
      href={`/documents/${doc.slug}`}
      className="border-line bg-paper-raised hover:border-flame flex flex-col rounded-[var(--radius-tile)] border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="text-ink-soft font-mono text-[11px]">
        {doc.category.name}
        {doc.grade && ` · ${GRADE_LABELS[doc.grade]}`}
      </p>
      <h3 className="font-display text-ink mt-1.5 line-clamp-2 text-base font-semibold">
        {doc.title}
      </h3>
      {doc.description && (
        <p className="text-ink-soft mt-2 line-clamp-2 flex-1 text-sm leading-relaxed">
          {doc.description}
        </p>
      )}
      <div className="border-line text-ink-soft mt-4 flex items-center justify-between border-t pt-3 text-xs">
        <span className="truncate">{doc.uploader.displayName}</span>
        <span className="shrink-0 font-mono">
          {doc.viewCount} xem · {doc.downloadCount} tải
        </span>
      </div>
    </Link>
  );
}
