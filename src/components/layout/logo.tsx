"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { cn } from "@/lib/utils";

const HEIGHT_CLASSES = {
  sm: "h-12",
  md: "h-16",
  lg: "h-18",
} as const;

// Kích thước pixel THẬT của từng file ảnh (khác tỉ lệ đôi chút giữa 2
// bản: 447x132 ~ 3.39:1 và 850x272 ~ 3.13:1) — truyền đúng theo từng
// bản để next/image + CSS "w-auto" tính đúng chiều rộng hiển thị, không
// méo ảnh dù dùng chung 1 class chiều cao cho cả hai.
const VARIANTS = {
  light: { src: "/logo-light.png", width: 850, height: 272 },
  dark: { src: "/logo-dark.png", width: 447, height: 132 },
} as const;

interface LogoProps {
  size?: keyof typeof HEIGHT_CLASSES;
  className?: string;
}

/**
 * Logo đầy đủ Nguyên Tố (icon + chữ "NGUYÊN TỐ" + tagline dựng sẵn trong
 * ảnh) — 2 file riêng cho sáng/tối, cả hai đều có NỀN ĐẶC khớp màu nền
 * trang ở theme tương ứng (không trong suốt): `public/logo-light.png`
 * (nền trắng) và `public/logo-dark.png` (nền navy đậm).
 *
 * Phải biết theme THẬT ĐÃ ÁP DỤNG (`resolvedTheme` — khác `theme`, vì
 * theme có thể đang là "system" và bản thân giá trị đó không nói lên
 * sáng hay tối cụ thể) nên bắt buộc Client Component, và phải đợi mount
 * xong mới render — server không thể biết theme đã lưu trong
 * localStorage của trình duyệt, nếu render ngay lúc SSR sẽ có lúc hiển
 * thị sai bản (sáng/tối) trong khoảnh khắc đầu rồi mới nhảy sang bản
 * đúng. Đây là pattern giống hệt `ThemeToggle` — xem giải thích chi tiết
 * ở component đó.
 */
export function Logo({ size = "lg", className }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- xem giải thích trong ThemeToggle
  useEffect(() => setMounted(true), []);

  const heightClass = HEIGHT_CLASSES[size];

  if (!mounted) {
    // Chưa biết theme thật — giữ chỗ đúng tỉ lệ trung bình 2 bản để
    // không giật layout khi ảnh thật hiện ra, nhưng không hiển thị ảnh
    // nào (tránh flash sai bản sáng/tối).
    return (
      <div
        className={cn(heightClass, "aspect-[3.2/1]", className)}
        aria-hidden
      />
    );
  }

  const variant = resolvedTheme === "dark" ? VARIANTS.dark : VARIANTS.light;

  return (
    <Image
      key={variant.src}
      src={variant.src}
      alt="Nguyên Tố — Thư viện tài liệu Hóa học"
      width={variant.width}
      height={variant.height}
      priority
      className={cn(
        heightClass,
        "w-auto rounded-[var(--radius-tile)]",
        className,
      )}
    />
  );
}
