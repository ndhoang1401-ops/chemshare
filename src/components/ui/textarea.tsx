import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "border-line bg-paper-raised text-ink placeholder:text-ink-soft/70 focus:border-flame focus:ring-flame/20 w-full resize-y rounded-[var(--radius-tile)] border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
