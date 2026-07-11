import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-alert mt-1.5 text-xs">{children}</p>;
}

export function FormBanner({
  variant = "error",
  children,
}: {
  variant?: "error" | "success";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-tile)] border px-4 py-3 text-sm leading-relaxed",
        variant === "error"
          ? "border-alert/30 bg-alert/5 text-alert"
          : "border-success/30 bg-success/5 text-success",
      )}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
