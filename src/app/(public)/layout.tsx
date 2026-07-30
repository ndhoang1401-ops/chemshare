import Link from "next/link";
import { auth } from "@/auth";
import { ROLE_LABELS, SITE_NAME } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/search", label: "Tìm tài liệu" },
  { href: "/tools", label: "Tiện ích Hóa học" },
];

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-line bg-paper/90 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Logo size="sm" />
            </Link>

            <nav className="hidden items-center gap-5 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-ink-soft hover:text-flame text-sm whitespace-nowrap transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {session?.user ? (
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <Link
                href="/upload"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "hidden sm:inline-flex",
                )}
              >
                Đăng tài liệu
              </Link>
              <Link
                href="/profile"
                className="hidden min-w-0 items-center gap-2 text-sm hover:opacity-80 sm:flex"
              >
                <Avatar
                  src={session.user.image}
                  name={session.user.name ?? "?"}
                  size="sm"
                />
                <span className="text-ink max-w-[10rem] truncate">
                  {session.user.name}
                </span>
                <span className="text-ink-soft hidden whitespace-nowrap xl:inline">
                  · {ROLE_LABELS[session.user.role]}
                </span>
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Đăng nhập
              </Link>
              <Link href="/register" className={buttonVariants({ size: "sm" })}>
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        <div className="border-line border-t px-6 py-2 md:hidden">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-soft hover:text-flame text-sm whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
            {session?.user && (
              <Link
                href="/upload"
                className="text-ink-soft hover:text-flame text-sm whitespace-nowrap sm:hidden"
              >
                Đăng tải
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-line bg-paper-raised border-t">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <Logo size="sm" />
              <p className="text-ink-soft mt-3 text-xs leading-relaxed">
                Nền tảng chia sẻ tài liệu Hóa học cho học sinh, sinh viên, giáo
                viên và người tự học. Mọi tài liệu đều qua kiểm duyệt trước khi
                công khai.
              </p>
            </div>
            <div>
              <p className="text-ink-soft font-mono text-xs tracking-wide uppercase">
                Khám phá
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/search"
                    className="text-ink-soft hover:text-flame"
                  >
                    Tìm tài liệu
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools"
                    className="text-ink-soft hover:text-flame"
                  >
                    Tiện ích Hóa học
                  </Link>
                </li>
                <li>
                  <Link
                    href="/upload"
                    className="text-ink-soft hover:text-flame"
                  >
                    Đăng tài liệu
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-ink-soft font-mono text-xs tracking-wide uppercase">
                Tiện ích
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/tools/periodic-table"
                    className="text-ink-soft hover:text-flame"
                  >
                    Bảng tuần hoàn
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/molar-mass"
                    className="text-ink-soft hover:text-flame"
                  >
                    Tính khối lượng mol
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/equation-balancer"
                    className="text-ink-soft hover:text-flame"
                  >
                    Cân bằng phương trình
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <p className="border-line text-ink-soft mt-8 border-t pt-4 text-xs">
            © {new Date().getFullYear()} {SITE_NAME}. Created by Nguyễn Doãn
            Hoàng.
          </p>
        </div>
      </footer>
    </div>
  );
}
