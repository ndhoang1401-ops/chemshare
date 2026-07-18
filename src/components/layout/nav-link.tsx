"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
  /** Mặc định so khớp chính xác; bật để active cả các route con (vd. /admin/documents/123). */
  matchPrefix?: boolean;
}

export function NavLink({
  href,
  label,
  icon: Icon,
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
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
      {!!badge && (
        <span className="bg-flame text-paper-raised flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px]">
          {badge}
        </span>
      )}
    </Link>
  );
}
