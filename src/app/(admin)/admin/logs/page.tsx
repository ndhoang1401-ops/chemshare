import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Nhật ký hoạt động",
};

const ACTION_LABELS: Record<string, string> = {
  "document.approve": "Duyệt tài liệu",
  "document.reject": "Từ chối tài liệu",
  "document.delete": "Xóa tài liệu",
  "user.role_change": "Đổi vai trò người dùng",
  "user.lock": "Khóa tài khoản",
  "user.unlock": "Mở khóa tài khoản",
  "category.create": "Thêm danh mục",
  "category.delete": "Xóa danh mục",
};

function describeMetadata(action: string, metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;

  if (action === "document.reject" && typeof m.note === "string") {
    return `Lý do: ${m.note}`;
  }
  if (action === "user.role_change" && m.from && m.to) {
    return `${m.from} → ${m.to}`;
  }
  if (
    (action === "document.delete" || action === "category.delete") &&
    typeof m.title === "string"
  ) {
    return `"${m.title}"`;
  }
  if (action === "category.create" && typeof m.name === "string") {
    return `"${m.name}"`;
  }
  return null;
}

export default async function AdminLogsPage() {
  await requireAdmin();

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { displayName: true, email: true } } },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-semibold">
        Nhật ký hoạt động
      </h1>
      <p className="text-ink-soft mb-8 text-sm">
        {logs.length} hoạt động gần nhất.
      </p>

      {logs.length === 0 ? (
        <p className="border-line text-ink-soft rounded-[var(--radius-tile)] border border-dashed px-4 py-8 text-center text-sm">
          Chưa có hoạt động nào được ghi lại.
        </p>
      ) : (
        <ul className="divide-line border-line divide-y rounded-[var(--radius-tile)] border">
          {logs.map((log) => {
            const detail = describeMetadata(log.action, log.metadata);
            return (
              <li
                key={log.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm"
              >
                <span className="text-ink font-medium">
                  {ACTION_LABELS[log.action] ?? log.action}
                </span>
                <span className="text-ink-soft">
                  bởi {log.user?.displayName ?? "(đã xóa)"}
                </span>
                {detail && (
                  <span className="text-ink-soft italic">{detail}</span>
                )}
                <span className="text-ink-soft ml-auto shrink-0 font-mono text-[11px]">
                  {log.createdAt.toLocaleString("vi-VN")}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
