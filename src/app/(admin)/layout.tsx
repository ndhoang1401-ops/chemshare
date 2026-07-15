import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLE_LABELS, SITE_NAME, USER_ROLES } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";

const REVIEWER_ROLES: string[] = [USER_ROLES.MODERATOR, USER_ROLES.ADMIN];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Phòng vệ ở tầng layout, ngoài proxy.ts đã chặn ở tầng route.
  if (!session?.user || !REVIEWER_ROLES.includes(session.user.role)) {
    redirect("/");
  }

  const isAdmin = session.user.role === USER_ROLES.ADMIN;

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/approvals", label: "Hàng chờ phê duyệt" },
    { href: "/admin/documents", label: "Tài liệu" },
    { href: "/admin/stats", label: "Thống kê" },
    ...(isAdmin
      ? [
          { href: "/admin/users", label: "Người dùng" },
          { href: "/admin/categories", label: "Danh mục" },
          { href: "/admin/logs", label: "Nhật ký" },
        ]
      : []),
  ];

  return (
    <div className="bg-paper min-h-screen">
      <header className="border-line border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="border-line bg-flame text-paper-raised flex h-8 w-8 flex-col items-center justify-center rounded-[var(--radius-tile)] border">
              <span className="font-display text-sm leading-none font-semibold">
                Nt
              </span>
            </div>
            <span className="font-display text-ink text-sm font-semibold">
              {SITE_NAME} · Quản trị
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Avatar
              src={session.user.image}
              name={session.user.name ?? session.user.email ?? "?"}
              size="sm"
            />
            <span className="text-ink hidden text-sm sm:inline">
              {session.user.name}
              <span className="text-ink-soft">
                {" "}
                · {ROLE_LABELS[session.user.role]}
              </span>
            </span>
            <LogoutButton />
          </div>
        </div>

        <div className="mx-auto max-w-5xl overflow-x-auto px-6">
          <nav className="flex items-center gap-5 pb-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-soft hover:text-flame shrink-0 text-sm whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
