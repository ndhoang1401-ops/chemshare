import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { USER_ROLES } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { NavLink } from "@/components/layout/nav-link";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
          <Link href="/">
            <Logo size="sm" />
          </Link>

          {session?.user && (
            <div className="flex min-w-0 shrink-0 items-center gap-3">
              <ThemeToggle />
              <Avatar
                src={session.user.image}
                name={session.user.name ?? session.user.email ?? "?"}
                size="sm"
              />
              <span className="text-ink hidden max-w-[10rem] truncate text-sm sm:inline">
                {session.user.name}
              </span>
              <LogoutButton />
            </div>
          )}
        </div>

        <div className="border-line border-t">
          <nav className="mx-auto flex max-w-3xl items-center gap-1 overflow-x-auto px-4 py-1.5">
            <NavLink
              href="/profile"
              label="Hồ sơ"
              icon={<User className="h-3.5 w-3.5" />}
            />
            <NavLink
              href="/upload"
              label="Đăng tải"
              icon={<Upload className="h-3.5 w-3.5" />}
            />
            <NavLink
              href="/notifications"
              label="Thông báo"
              icon={<Bell className="h-3.5 w-3.5" />}
              badge={unreadCount}
            />
            {isReviewer && (
              <NavLink
                href="/admin"
                label="Kiểm duyệt"
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
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
