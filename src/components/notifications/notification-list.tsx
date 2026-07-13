"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

export function NotificationList({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const router = useRouter();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const hasUnread = notifications.some((n) => !n.isRead && !readIds.has(n.id));

  function markOneRead(id: string) {
    if (readIds.has(id)) return;
    setReadIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      router.refresh();
    });
  }

  function markAllRead() {
    startTransition(async () => {
      await fetch("/api/notifications/read-all", { method: "POST" });
      router.refresh();
    });
  }

  if (notifications.length === 0) {
    return (
      <p className="border-line text-ink-soft rounded-[var(--radius-tile)] border border-dashed px-4 py-8 text-center text-sm">
        Bạn chưa có thông báo nào.
      </p>
    );
  }

  return (
    <div>
      {hasUnread && (
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={markAllRead}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      )}

      <ul className="divide-line border-line divide-y rounded-[var(--radius-tile)] border">
        {notifications.map((n) => {
          const isRead = n.isRead || readIds.has(n.id);
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markOneRead(n.id)}
                className={cn(
                  "hover:bg-paper w-full px-4 py-3 text-left transition-colors",
                  !isRead && "bg-flame/5",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={cn(
                      "text-sm",
                      isRead ? "text-ink-soft" : "text-ink font-medium",
                    )}
                  >
                    {!isRead && (
                      <span className="bg-flame mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle" />
                    )}
                    {n.title}
                  </p>
                  <span className="text-ink-soft shrink-0 font-mono text-[11px]">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-ink-soft mt-1 text-sm">{n.content}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
