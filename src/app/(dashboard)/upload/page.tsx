import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UploadForm } from "@/components/documents/upload-form";

export const metadata: Metadata = {
  title: "Đăng tải tài liệu",
};

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/upload");
  }

  const categories = await prisma.category.findMany({
    orderBy: [{ group: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-semibold">
        Đăng tải tài liệu
      </h1>
      <p className="text-ink-soft mb-8 text-sm">
        Tài liệu sẽ ở trạng thái &ldquo;chờ duyệt&rdquo; cho đến khi kiểm duyệt
        viên xem xét và phê duyệt.
      </p>
      <UploadForm categories={categories} />
    </div>
  );
}
