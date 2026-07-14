import { prisma } from "@/lib/prisma";
import type { Grade, Prisma } from "@prisma/client";

export interface SearchOptions {
  q?: string;
  categorySlug?: string;
  grade?: Grade;
  page?: number;
}

export const SEARCH_PAGE_SIZE = 12;
/** Giới hạn số ứng viên khớp full-text trước khi lọc thêm — đủ dùng cho
 * quy mô tài liệu vừa/nhỏ; xem NEXTJS_NOTES.md nếu cần mở rộng. */
const MAX_FTS_CANDIDATES = 300;

const documentInclude = {
  category: { select: { name: true, slug: true } },
  uploader: { select: { displayName: true } },
} satisfies Prisma.DocumentInclude;

export type SearchResultDocument = Prisma.DocumentGetPayload<{
  include: typeof documentInclude;
}>;

export interface SearchResult {
  documents: SearchResultDocument[];
  total: number;
  page: number;
  pageCount: number;
}

/**
 * Tìm tài liệu đã duyệt theo từ khóa (tiêu đề/từ khóa/tác giả/mô tả) +
 * lọc theo chuyên đề/lớp. Dùng PostgreSQL full-text search (config
 * "simple" — Postgres không có dictionary tiếng Việt sẵn nên "simple"
 * (tách từ, không stemming) là lựa chọn an toàn hơn "english").
 *
 * Cách làm: chạy raw SQL để lấy danh sách id đã xếp hạng theo độ liên
 * quan, rồi dùng Prisma findMany bình thường để lấy đầy đủ quan hệ
 * (category, uploader) + áp thêm bộ lọc chuyên đề/lớp — vừa an toàn kiểu
 * dữ liệu vừa tận dụng được ranking của Postgres.
 */
export async function searchDocuments({
  q,
  categorySlug,
  grade,
  page = 1,
}: SearchOptions): Promise<SearchResult> {
  const category = categorySlug
    ? await prisma.category.findUnique({ where: { slug: categorySlug } })
    : null;

  const baseWhere = {
    status: "APPROVED" as const,
    ...(category ? { categoryId: category.id } : {}),
    ...(grade ? { grade } : {}),
  };

  const trimmedQuery = q?.trim();

  if (trimmedQuery) {
    const ranked = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM documents
      WHERE status = 'APPROVED'
        AND (
          setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(array_to_string(keywords, ' '), '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(author, '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(description, '')), 'C')
        ) @@ websearch_to_tsquery('simple', ${trimmedQuery})
      ORDER BY ts_rank(
        setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(array_to_string(keywords, ' '), '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(author, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(description, '')), 'C'),
        websearch_to_tsquery('simple', ${trimmedQuery})
      ) DESC
      LIMIT ${MAX_FTS_CANDIDATES}
    `;

    const rankedIds = ranked.map((r) => r.id);
    if (rankedIds.length === 0) {
      return { documents: [], total: 0, page, pageCount: 0 };
    }

    const matched = await prisma.document.findMany({
      where: { ...baseWhere, id: { in: rankedIds } },
      include: documentInclude,
    });

    const rankIndex = new Map(rankedIds.map((id, idx) => [id, idx]));
    matched.sort(
      (a, b) => (rankIndex.get(a.id) ?? 0) - (rankIndex.get(b.id) ?? 0),
    );

    const total = matched.length;
    const start = (page - 1) * SEARCH_PAGE_SIZE;
    const documents = matched.slice(start, start + SEARCH_PAGE_SIZE);

    return {
      documents,
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE)),
    };
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      include: documentInclude,
      skip: (page - 1) * SEARCH_PAGE_SIZE,
      take: SEARCH_PAGE_SIZE,
    }),
    prisma.document.count({ where: baseWhere }),
  ]);

  return {
    documents,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE)),
  };
}
