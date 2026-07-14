"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormBanner } from "@/components/ui/form-message";

export function DownloadButton({
  documentId,
  isLoggedIn,
}: {
  documentId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <div>
        <Button disabled className="w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Tải xuống
        </Button>
        <p className="text-ink-soft mt-2 text-xs">
          <Link href="/login" className="text-flame hover:underline">
            Đăng nhập
          </Link>{" "}
          để tải tài liệu.
        </p>
      </div>
    );
  }

  function handleDownload() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/documents/${documentId}/download`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          res.status === 403
            ? "Bạn không có quyền tải tài liệu này."
            : "Đã có lỗi xảy ra, vui lòng thử lại.",
        );
        return;
      }

      window.location.href = data.url;
      router.refresh();
    });
  }

  return (
    <div>
      <Button
        onClick={handleDownload}
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        <Download className="h-4 w-4" />
        {isPending ? "Đang chuẩn bị..." : "Tải xuống"}
      </Button>
      {error && (
        <div className="mt-2">
          <FormBanner variant="error">{error}</FormBanner>
        </div>
      )}
    </div>
  );
}
