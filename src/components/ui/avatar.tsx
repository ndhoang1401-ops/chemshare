import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-base",
  lg: "h-20 w-20 text-2xl",
};

/** Lấy 1-2 chữ cái đầu để làm avatar khi chưa có ảnh (ví dụ "Nguyễn Văn A" -> "NA") */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const base = cn(
    "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-flame font-display font-semibold text-on-flame",
    SIZE_CLASSES[size],
    className,
  );

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL ảnh do người dùng tự nhập, chưa cấu hình domain cho next/image
      <img src={src} alt={name} className={cn(base, "bg-paper-raised")} />
    );
  }

  return <div className={base}>{getInitials(name)}</div>;
}
