import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/lib/constants";

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Chờ duyệt",
    className: "border-amber/30 bg-amber/10 text-amber",
  },
  APPROVED: {
    label: "Đã duyệt",
    className: "border-success/30 bg-success/10 text-success",
  },
  REJECTED: {
    label: "Bị từ chối",
    className: "border-alert/30 bg-alert/10 text-alert",
  },
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-tile)] border px-2 py-0.5 font-mono text-[11px] font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
