"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
  /**
   * Truyền vào 1 element đã render sẵn (vd. `<User className="h-3.5 w-3.5" />`),
   * KHÔNG truyền component/type (vd. `User`). Server Component không được
   * phép truyền thẳng function/class cho Client Component qua props —
   * chỉ được truyền kết quả đã render (ReactNode). Đây là nơi bị lỗi
   * "Only plain objects can be passed to Client Components..." trước đó.
   */
  icon?: ReactNode;
  badge?: number;
  /** Mặc định so khớp chính xác; bật để active cả các route con (vd. /admin/documents/123). */
  matchPrefix?: boolean;
}

export function NavLink({
  href,
  label,
  icon,
  badge,
  matchPrefix,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = matchPrefix ? pathname.startsWith(href) : pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-[var(--radius-tile)] px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors",
        isActive
          ? "bg-flame/10 text-flame"
          : "text-ink-soft hover:bg-paper-raised hover:text-flame",
      )}
    >
      {icon}
      {label}
      {!!badge && (
        <span className="bg-flame text-paper-raised flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px]">
          {badge}
        </span>
      )}
    </Link>
  );
}
