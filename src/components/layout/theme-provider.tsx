"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Bọc next-themes.ThemeProvider trong 1 client component riêng — root
 * layout.tsx vẫn có thể là Server Component, chỉ phần quản lý theme này
 * mới cần chạy phía client (next-themes cần đọc/ghi localStorage + set
 * class trên thẻ html).
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
