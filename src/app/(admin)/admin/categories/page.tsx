import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = {
  title: "Quản lý danh mục",
};

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { documents: true } } },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-semibold">
        Quản lý danh mục
      </h1>
      <p className="text-ink-soft mb-6 text-sm">
        {categories.length} chuyên đề Hóa học. Không xóa được danh mục còn tài
        liệu.
      </p>

      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          tile: c.tile,
          group: c.group,
          documentCount: c._count.documents,
        }))}
      />
    </div>
  );
}
