import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, USER_ROLES } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";

const REVIEWER_ROLES: string[] = [USER_ROLES.MODERATOR, USER_ROLES.ADMIN];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const unreadCount = session?.user
    ? await prisma.notification.count({
        where: { userId: session.user.id, isRead: false },
      })
    : 0;

  const navLinks = [
    { href: "/profile", label: "Hồ sơ" },
    { href: "/upload", label: "Đăng tải" },
    { href: "/notifications", label: "Thông báo", badge: unreadCount },
  ];

  const isReviewer =
    !!session?.user && REVIEWER_ROLES.includes(session.user.role);

  return (
    <div className="bg-paper min-h-screen">
      <header className="border-line border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="border-line bg-flame text-paper-raised flex h-8 w-8 flex-col items-center justify-center rounded-[var(--radius-tile)] border">
                <span className="font-display text-sm leading-none font-semibold">
                  Nt
                </span>
              </div>
              <span className="font-display text-ink text-sm font-semibold">
                {SITE_NAME}
              </span>
            </Link>

            <nav className="hidden items-center gap-4 sm:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-ink-soft hover:text-flame flex items-center gap-1.5 text-sm"
                >
                  {link.label}
                  {!!link.badge && (
                    <span className="bg-flame text-paper-raised flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px]">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              {isReviewer && (
                <Link
                  href="/admin/approvals"
                  className="text-ink-soft hover:text-flame text-sm"
                >
                  Kiểm duyệt
                </Link>
              )}
            </nav>
          </div>

          {session?.user && (
            <div className="flex items-center gap-3">
              <Avatar
                src={session.user.image}
                name={session.user.name ?? session.user.email ?? "?"}
                size="sm"
              />
              <span className="text-ink hidden text-sm sm:inline">
                {session.user.name}
              </span>
              <LogoutButton />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
    </div>
  );
}
