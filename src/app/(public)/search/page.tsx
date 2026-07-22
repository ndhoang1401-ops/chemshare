import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { searchDocuments } from "@/lib/search";
import type { Grade } from "@prisma/client";
import { SearchForm } from "@/components/documents/search-form";
import { DocumentCard } from "@/components/documents/document-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tìm kiếm tài liệu",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    grade?: string;
    page?: string;
  }>;
}

const VALID_GRADES = new Set([
  "GRADE_8",
  "GRADE_9",
  "GRADE_10",
  "GRADE_11",
  "GRADE_12",
]);

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const grade = VALID_GRADES.has(params.grade ?? "")
    ? (params.grade as Grade)
    : undefined;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });

  const { documents, total, pageCount } = await searchDocuments({
    q: params.q,
    categorySlug: params.category,
    grade,
    page,
  });

  function pageHref(target: number) {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.category) query.set("category", params.category);
    if (params.grade) query.set("grade", params.grade);
    query.set("page", String(target));
    return `/search?${query.toString()}`;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <SearchForm
        categories={categories}
        defaultQuery={params.q}
        defaultCategory={params.category}
        defaultGrade={params.grade}
      />

      <p className="text-ink-soft mt-6 mb-4 text-sm">
        {total === 0 ? "Không tìm thấy tài liệu nào." : `${total} kết quả`}
      </p>

      {documents.length === 0 ? (
        <p className="border-line text-ink-soft rounded-[var(--radius-tile)] border border-dashed px-4 py-10 text-center text-sm">
          Thử đổi từ khóa hoặc bỏ bớt bộ lọc chuyên đề/lớp.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>

          {pageCount > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-[var(--radius-tile)] border text-sm",
                    p === page
                      ? "border-flame bg-flame text-on-flame"
                      : "border-line text-ink-soft hover:border-flame hover:text-flame",
                  )}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
