import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GRADE_LABELS, ROLE_LABELS } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
        include: { category: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const totalViews = user.documents.reduce((sum, d) => sum + d.viewCount, 0);
  const totalDownloads = user.documents.reduce(
    (sum, d) => sum + d.downloadCount,
    0,
  );

  return (
    <div className="space-y-10">
      <section className="flex items-start gap-5">
        <Avatar src={user.avatar} name={user.displayName} size="lg" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold">
              {user.displayName}
            </h1>
            <span className="border-line text-ink-soft rounded-[var(--radius-tile)] border px-2 py-0.5 font-mono text-[11px]">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <p className="text-ink-soft text-sm">{user.email}</p>
          {user.bio && (
            <p className="text-ink mt-2 max-w-lg text-sm leading-relaxed">
              {user.bio}
            </p>
          )}
        </div>
      </section>

      <section className="divide-line border-line grid grid-cols-3 divide-x rounded-[var(--radius-tile)] border">
        <Stat label="Tài liệu đã đăng" value={user.documents.length} />
        <Stat label="Lượt xem" value={totalViews} />
        <Stat label="Lượt tải" value={totalDownloads} />
      </section>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold">
          Tài liệu đã đăng
        </h2>
        {user.documents.length === 0 ? (
          <p className="border-line text-ink-soft rounded-[var(--radius-tile)] border border-dashed px-4 py-8 text-center text-sm">
            Bạn chưa đăng tài liệu nào. Tính năng đăng tải sẽ có ở Giai đoạn 4.
          </p>
        ) : (
          <ul className="divide-line border-line divide-y rounded-[var(--radius-tile)] border">
            {user.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-ink truncate text-sm font-medium">
                    {doc.title}
                  </p>
                  <p className="text-ink-soft mt-0.5 font-mono text-xs">
                    {doc.category.name}
                    {doc.grade && ` · ${GRADE_LABELS[doc.grade]}`} ·{" "}
                    {doc.viewCount} lượt xem · {doc.downloadCount} lượt tải
                  </p>
                </div>
                <DocumentStatusBadge status={doc.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold">
          Chỉnh sửa hồ sơ
        </h2>
        <ProfileForm
          initialDisplayName={user.displayName}
          initialBio={user.bio ?? ""}
          initialAvatar={user.avatar ?? ""}
        />
      </section>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold">
          Đổi mật khẩu
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 py-4 text-center">
      <p className="font-display text-ink text-2xl font-semibold">{value}</p>
      <p className="text-ink-soft mt-1 font-mono text-[11px]">{label}</p>
    </div>
  );
}
