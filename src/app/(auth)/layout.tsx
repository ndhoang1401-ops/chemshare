import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="border-line bg-flame text-paper-raised flex h-9 w-9 flex-col items-center justify-center rounded-[var(--radius-tile)] border">
          <span className="font-display text-sm leading-none font-semibold">
            Nt
          </span>
        </div>
        <span className="font-display text-ink text-base font-semibold">
          {SITE_NAME}
        </span>
      </Link>
      <div className="border-line bg-paper-raised w-full max-w-sm rounded-[var(--radius-tile)] border p-8">
        {children}
      </div>
    </div>
  );
}
