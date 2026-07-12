import Link from "next/link";
import { auth } from "@/auth";
import { SITE_NAME } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";

const NAV_LINKS = [
  { href: "/profile", label: "Hồ sơ" },
  { href: "/upload", label: "Đăng tải" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

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
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-ink-soft hover:text-flame text-sm"
                >
                  {link.label}
                </Link>
              ))}
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
