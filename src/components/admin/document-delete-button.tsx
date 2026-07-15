"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function DocumentDeleteButton({
  documentId,
  title,
}: {
  documentId: string;
  title: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/documents/${documentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
      setConfirming(false);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-ink-soft">Xóa &ldquo;{title}&rdquo;?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-alert font-medium hover:underline"
        >
          {isPending ? "Đang xóa..." : "Xác nhận"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-ink-soft hover:text-flame"
        >
          Hủy
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-ink-soft hover:text-alert text-xs"
    >
      Xóa
    </button>
  );
}
