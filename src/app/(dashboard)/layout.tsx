import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, USER_ROLES } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { NavLink } from "@/components/layout/nav-link";
import { User, Upload, Bell, ShieldCheck } from "lucide-react";

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

  const isReviewer =
    !!session?.user && REVIEWER_ROLES.includes(session.user.role);

  return (
    <div className="bg-paper min-h-screen">
      <header className="border-line bg-paper/90 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="border-line bg-flame text-paper-raised flex h-8 w-8 flex-col items-center justify-center rounded-[var(--radius-tile)] border">
              <span className="font-display text-sm leading-none font-semibold">
                Nt
              </span>
            </div>
            <span className="font-display text-ink hidden text-sm font-semibold sm:inline">
              {SITE_NAME}
            </span>
          </Link>

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

        <div className="border-line border-t">
          <nav className="mx-auto flex max-w-3xl items-center gap-1 overflow-x-auto px-4 py-1.5">
            <NavLink href="/profile" label="Hồ sơ" icon={User} />
            <NavLink href="/upload" label="Đăng tải" icon={Upload} />
            <NavLink
              href="/notifications"
              label="Thông báo"
              icon={Bell}
              badge={unreadCount}
            />
            {isReviewer && (
              <NavLink
                href="/admin"
                label="Kiểm duyệt"
                icon={ShieldCheck}
                matchPrefix
              />
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
    </div>
  );
}
