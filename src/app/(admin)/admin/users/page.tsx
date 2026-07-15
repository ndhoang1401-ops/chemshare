import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { UserRow } from "@/components/admin/user-row";

export const metadata: Metadata = {
  title: "Quản lý người dùng",
};

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { documents: true } } },
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-semibold">
        Quản lý người dùng
      </h1>
      <p className="text-ink-soft mb-8 text-sm">{users.length} người dùng.</p>

      <ul className="divide-line border-line divide-y rounded-[var(--radius-tile)] border">
        {users.map((user) => (
          <UserRow
            key={user.id}
            isSelf={user.id === session.user.id}
            user={{
              id: user.id,
              email: user.email,
              displayName: user.displayName,
              avatar: user.avatar,
              role: user.role,
              isActive: user.isActive,
              createdAt: user.createdAt.toISOString(),
              documentCount: user._count.documents,
            }}
          />
        ))}
      </ul>
    </div>
  );
}
