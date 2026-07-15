import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireReviewer } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Thống kê tải xuống",
};

export default async function AdminStatsPage() {
  await requireReviewer();

  const [topDocuments, categoryStats, recentDownloads, totals] =
    await Promise.all([
      prisma.document.findMany({
        where: { status: "APPROVED" },
        orderBy: { downloadCount: "desc" },
        take: 10,
        select: {
          id: true,
          slug: true,
          title: true,
          downloadCount: true,
          viewCount: true,
        },
      }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          documents: { select: { downloadCount: true } },
        },
      }),
      prisma.download.findMany({
        orderBy: { downloadedAt: "desc" },
        take: 20,
        include: {
          document: { select: { title: true, slug: true } },
          user: { select: { displayName: true } },
        },
      }),
      prisma.document.aggregate({
        where: { status: "APPROVED" },
        _sum: { downloadCount: true, viewCount: true },
      }),
    ]);

  const categoryTotals = categoryStats
    .map((c) => ({
      id: c.id,
      name: c.name,
      total: c.documents.reduce((sum, d) => sum + d.downloadCount, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .filter((c) => c.total > 0);

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-semibold">
        Thống kê tải xuống
      </h1>
      <p className="text-ink-soft mb-8 text-sm">
        Tổng {totals._sum.downloadCount ?? 0} lượt tải ·{" "}
        {totals._sum.viewCount ?? 0} lượt xem (tài liệu đã duyệt).
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display mb-3 text-base font-semibold">
            Tài liệu được tải nhiều nhất
          </h2>
          {topDocuments.length === 0 ? (
            <EmptyState />
          ) : (
            <ol className="divide-line border-line divide-y rounded-[var(--radius-tile)] border">
              {topDocuments.map((doc, index) => (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="text-ink-soft w-5 shrink-0 font-mono text-xs">
                    {index + 1}
                  </span>
                  <Link
                    href={`/documents/${doc.slug}`}
                    className="text-ink hover:text-flame min-w-0 flex-1 truncate"
                  >
                    {doc.title}
                  </Link>
                  <span className="text-ink-soft shrink-0 font-mono text-xs">
                    {doc.downloadCount} tải
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <h2 className="font-display mb-3 text-base font-semibold">
            Lượt tải theo chuyên đề
          </h2>
          {categoryTotals.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-line border-line divide-y rounded-[var(--radius-tile)] border">
              {categoryTotals.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="text-ink">{c.name}</span>
                  <span className="text-ink-soft font-mono text-xs">
                    {c.total} tải
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-8">
        <h2 className="font-display mb-3 text-base font-semibold">
          Lượt tải gần đây
        </h2>
        {recentDownloads.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-line border-line divide-y rounded-[var(--radius-tile)] border">
            {recentDownloads.map((dl) => (
              <li
                key={dl.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm"
              >
                <span className="text-ink-soft">{dl.user.displayName}</span>
                <span className="text-ink-soft">đã tải</span>
                <Link
                  href={`/documents/${dl.document.slug}`}
                  className="text-ink hover:text-flame min-w-0 flex-1 truncate"
                >
                  {dl.document.title}
                </Link>
                <span className="text-ink-soft shrink-0 font-mono text-[11px]">
                  {dl.downloadedAt.toLocaleString("vi-VN")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <p className="border-line text-ink-soft rounded-[var(--radius-tile)] border border-dashed px-4 py-6 text-center text-sm">
      Chưa có dữ liệu.
    </p>
  );
}
