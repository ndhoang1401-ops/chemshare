import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-line/60 animate-pulse rounded-[var(--radius-tile)]",
        className,
      )}
    />
  );
}
