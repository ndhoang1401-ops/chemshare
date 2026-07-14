import Link from "next/link";
import { auth } from "@/auth";
import { ROLE_LABELS, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-line border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="border-line bg-flame text-paper-raised flex h-9 w-9 flex-col items-center justify-center rounded-[var(--radius-tile)] border">
              <span className="font-display text-sm leading-none font-semibold">
                Nt
              </span>
            </div>
            <div>
              <p className="font-display text-ink text-sm leading-none font-semibold">
                {SITE_NAME}
              </p>
              <p className="text-ink-soft hidden text-xs sm:block">
                {SITE_TAGLINE}
              </p>
            </div>
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="hidden items-center gap-2 text-sm hover:opacity-80 sm:flex"
              >
                <Avatar
                  src={session.user.image}
                  name={session.user.name ?? "?"}
                  size="sm"
                />
                <span className="text-ink">{session.user.name}</span>
                <span className="text-ink-soft">
                  · {ROLE_LABELS[session.user.role]}
                </span>
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
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
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-line border-t">
        <div className="text-ink-soft mx-auto max-w-5xl px-6 py-6 text-xs">
          <p>
            {SITE_NAME} · Nền tảng chia sẻ tài liệu Hóa học cho học sinh, sinh
            viên, giáo viên và người tự học.
          </p>
        </div>
      </footer>
    </div>
  );
}
