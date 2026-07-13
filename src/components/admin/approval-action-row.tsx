"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormBanner } from "@/components/ui/form-message";
import { GRADE_LABELS } from "@/lib/constants";

export interface PendingDocument {
  id: string;
  title: string;
  description: string | null;
  keywords: string[];
  author: string | null;
  grade: string | null;
  fileName: string;
  fileSize: number;
  createdAt: string;
  category: { name: string };
  uploader: { displayName: string; email: string };
  previewHref: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ApprovalActionRow({ doc }: { doc: PendingDocument }) {
  const router = useRouter();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitReview(status: "APPROVED" | "REJECTED") {
    setError(null);

    if (status === "REJECTED" && note.trim().length < 5) {
      setError("Vui lòng nhập lý do từ chối (ít nhất 5 ký tự).");
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/documents/${doc.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          status === "REJECTED" ? { status, note } : { status },
        ),
      });

      if (res.ok) {
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (data.error === "already_reviewed") {
        setError("Tài liệu này vừa được xử lý (có thể bởi người khác).");
        router.refresh();
        return;
      }
      setError("Đã có lỗi xảy ra, vui lòng thử lại.");
    });
  }

  return (
    <li className="border-line bg-paper-raised rounded-[var(--radius-tile)] border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-ink text-base font-semibold">
            {doc.title}
          </h3>
          <p className="text-ink-soft mt-0.5 font-mono text-xs">
            {doc.category.name}
            {doc.grade && ` · ${GRADE_LABELS[doc.grade]}`} · {doc.fileName} (
            {formatFileSize(doc.fileSize)})
          </p>
          <p className="text-ink-soft mt-1 text-xs">
            Đăng bởi{" "}
            <span className="text-ink">{doc.uploader.displayName}</span> (
            {doc.uploader.email})
          </p>
          {doc.author && (
            <p className="text-ink-soft mt-0.5 text-xs">
              Tác giả: {doc.author}
            </p>
          )}
        </div>

        <a
          href={doc.previewHref}
          target="_blank"
          rel="noopener noreferrer"
          className="border-line text-ink hover:border-flame hover:text-flame shrink-0 rounded-[var(--radius-tile)] border px-3 py-1.5 text-xs font-medium transition-colors"
        >
          Xem file
        </a>
      </div>

      {doc.description && (
        <p className="text-ink-soft mt-3 text-sm leading-relaxed">
          {doc.description}
        </p>
      )}

      {doc.keywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {doc.keywords.map((keyword) => (
            <span
              key={keyword}
              className="bg-paper text-ink-soft rounded-[var(--radius-tile)] px-2 py-0.5 font-mono text-[11px]"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-3">
          <FormBanner variant="error">{error}</FormBanner>
        </div>
      )}

      <div className="border-line mt-4 border-t pt-4">
        {!showRejectForm ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => submitReview("APPROVED")}
            >
              {isPending ? "Đang xử lý..." : "Duyệt"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => setShowRejectForm(true)}
            >
              Từ chối
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              rows={2}
              placeholder="Lý do từ chối (bắt buộc)..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => submitReview("REJECTED")}
              >
                {isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowRejectForm(false);
                  setError(null);
                }}
                className="text-ink-soft hover:text-flame text-sm"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
