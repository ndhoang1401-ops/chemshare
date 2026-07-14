import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";
import { SearchForm } from "@/components/documents/search-form";
import { DocumentCard } from "@/components/documents/document-card";

export default async function HomePage() {
  const documentInclude = {
    category: { select: { name: true, slug: true } },
    uploader: { select: { displayName: true } },
  } as const;

  const [
    categories,
    categoryCounts,
    latestDocuments,
    featuredDocuments,
    documentCount,
    userCount,
    downloadTotal,
  ] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.document.groupBy({
      by: ["categoryId"],
      where: { status: "APPROVED" },
      _count: { _all: true },
    }),
    prisma.document.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: documentInclude,
    }),
    prisma.document.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ downloadCount: "desc" }, { viewCount: "desc" }],
      take: 6,
      include: documentInclude,
    }),
    prisma.document.count({ where: { status: "APPROVED" } }),
    prisma.user.count(),
    prisma.document.aggregate({
      where: { status: "APPROVED" },
      _sum: { downloadCount: true },
    }),
  ]);

  const countByCategoryId = new Map(
    categoryCounts.map((c) => [c.categoryId, c._count._all]),
  );
  // Sắp theo số tài liệu giảm dần để "phổ biến" đúng nghĩa; chuyên mục
  // chưa có tài liệu vẫn hiển thị (nằm cuối) để người dùng biết còn trống.
  const popularCategories = [...categories].sort(
    (a, b) =>
      (countByCategoryId.get(b.id) ?? 0) - (countByCategoryId.get(a.id) ?? 0),
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <section className="py-6 text-center sm:py-10">
        <h1 className="font-display mx-auto max-w-2xl text-3xl leading-tight font-semibold text-balance sm:text-4xl">
          Nơi lưu trữ và chia sẻ tài liệu Hóa học đã qua kiểm duyệt
        </h1>
        <p className="text-ink-soft mx-auto mt-3 max-w-xl text-sm sm:text-base">
          Dành cho học sinh, sinh viên, giáo viên và người tự học.
        </p>
        <div className="mx-auto mt-6 max-w-2xl text-left">
          <SearchForm
            categories={CATEGORIES.map((c) => ({ slug: c.slug, name: c.name }))}
            large
          />
        </div>
      </section>

      <section className="border-line border-t py-10">
        <h2 className="font-display mb-4 text-lg font-semibold">
          Chuyên mục phổ biến
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
          {popularCategories.map((category) => (
            <Link
              key={category.id}
              href={`/search?category=${category.slug}`}
              className="group border-line bg-paper-raised hover:border-flame flex aspect-square flex-col items-center justify-center gap-0.5 rounded-[var(--radius-tile)] border transition-colors"
              title={category.name}
            >
              <span className="text-ink-soft font-mono text-[9px] leading-none">
                {countByCategoryId.get(category.id) ?? 0}
              </span>
              <span className="font-display text-sm leading-none font-semibold">
                {category.tile}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-line border-t py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            Tài liệu mới nhất
          </h2>
          <Link href="/search" className="text-flame text-sm hover:underline">
            Xem tất cả
          </Link>
        </div>
        {latestDocuments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>

      <section className="border-line border-t py-10">
        <h2 className="font-display mb-4 text-lg font-semibold">
          Tài liệu nổi bật
        </h2>
        {featuredDocuments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>

      <section className="divide-line border-line grid grid-cols-3 divide-x border-y py-6">
        <Stat label="Tài liệu đã duyệt" value={documentCount} />
        <Stat label="Thành viên" value={userCount} />
        <Stat label="Lượt tải" value={downloadTotal._sum.downloadCount ?? 0} />
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <p className="border-line text-ink-soft rounded-[var(--radius-tile)] border border-dashed px-4 py-8 text-center text-sm">
      Chưa có tài liệu nào ở mục này.
    </p>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 text-center">
      <p className="font-display text-ink text-2xl font-semibold">{value}</p>
      <p className="text-ink-soft mt-1 font-mono text-[11px]">{label}</p>
    </div>
  );
}
