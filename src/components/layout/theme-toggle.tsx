"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Theo hệ thống", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Tránh hiển thị sai theme lúc hydrate (server luôn không biết theme
  // client đã lưu trong localStorage) — chỉ render sau khi mount xong.
  // Đây là pattern chuẩn chính next-themes khuyến nghị: effect này đồng
  // bộ với hệ thống ngoài (biết đã chạy trên client hay chưa), không
  // phải cascading render thông thường mà rule set-state-in-effect nhắm
  // tới.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- xem giải thích phía trên
  useEffect(() => setMounted(true), []);

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];
  const CurrentIcon = current.icon;

  if (!mounted) {
    return <div className="h-8 w-8" aria-hidden />;
  }

  function cycleTheme() {
    const currentIndex = OPTIONS.findIndex((o) => o.value === theme);
    const next = OPTIONS[(currentIndex + 1) % OPTIONS.length] ?? OPTIONS[0];
    setTheme(next.value);
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={`Giao diện: ${current.label} (bấm để đổi)`}
      className={cn(
        "border-line text-ink-soft hover:border-flame hover:text-flame flex h-8 w-8 items-center justify-center rounded-[var(--radius-tile)] border transition-colors",
      )}
    >
      <CurrentIcon className="h-4 w-4" />
      <span className="sr-only">Đổi giao diện sáng/tối</span>
    </button>
  );
}
