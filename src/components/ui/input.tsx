import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "border-line bg-paper-raised text-ink placeholder:text-ink-soft/70 focus:border-flame focus:ring-flame/20 h-10 w-full rounded-[var(--radius-tile)] border px-3 text-sm transition-colors focus:ring-2 focus:outline-none",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
