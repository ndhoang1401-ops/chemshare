import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "border-line bg-paper-raised text-ink focus:border-flame focus:ring-flame/20 h-10 w-full rounded-[var(--radius-tile)] border px-3 text-sm transition-colors focus:ring-2 focus:outline-none",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
