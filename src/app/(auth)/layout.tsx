import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper relative flex min-h-screen flex-col items-center px-4 py-8 sm:justify-center sm:py-12">
      <div className="mb-8 flex w-full max-w-sm items-center justify-between sm:absolute sm:top-4 sm:right-4 sm:left-4 sm:mb-0 sm:max-w-none sm:justify-end">
        <Link href="/" className="sm:hidden">
          <Logo size="md" />
        </Link>
        <ThemeToggle />
      </div>
      <Link href="/" className="mb-8 hidden sm:block">
        <Logo size="lg" />
      </Link>
      <div className="border-line bg-paper-raised w-full max-w-sm rounded-[var(--radius-tile)] border p-8">
        {children}
      </div>
    </div>
  );
}
