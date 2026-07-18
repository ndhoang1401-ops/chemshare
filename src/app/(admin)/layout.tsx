import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLE_LABELS, SITE_NAME, USER_ROLES } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { NavLink } from "@/components/layout/nav-link";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  BarChart3,
  Users,
  FolderKanban,
  ScrollText,
} from "lucide-react";

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

  return (
    <div className="bg-paper min-h-screen">
      <header className="border-line bg-paper/90 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="border-line bg-flame text-paper-raised flex h-8 w-8 flex-col items-center justify-center rounded-[var(--radius-tile)] border">
              <span className="font-display text-sm leading-none font-semibold">
                Nt
              </span>
            </div>
            <span className="font-display text-ink text-sm font-semibold">
              {SITE_NAME} <span className="text-ink-soft">/ Quản trị</span>
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

        <div className="border-line border-t">
          <nav className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-1.5">
            <NavLink href="/admin" label="Dashboard" icon={LayoutDashboard} />
            <NavLink
              href="/admin/approvals"
              label="Phê duyệt"
              icon={ClipboardCheck}
            />
            <NavLink
              href="/admin/documents"
              label="Tài liệu"
              icon={FileText}
              matchPrefix
            />
            <NavLink href="/admin/stats" label="Thống kê" icon={BarChart3} />
            {isAdmin && (
              <>
                <NavLink href="/admin/users" label="Người dùng" icon={Users} />
                <NavLink
                  href="/admin/categories"
                  label="Danh mục"
                  icon={FolderKanban}
                />
                <NavLink href="/admin/logs" label="Nhật ký" icon={ScrollText} />
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
