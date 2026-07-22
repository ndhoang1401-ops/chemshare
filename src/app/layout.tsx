import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { ThemeProvider } from "@/components/layout/theme-provider";

// Font tự lưu trữ (self-hosted qua Fontsource) — không phụ thuộc gọi mạng
// tới Google Fonts lúc build/runtime, giúp tải nhanh và ổn định hơn khi
// triển khai production. Chỉ nạp đúng các weight/subset cần dùng.
import "@fontsource/source-serif-4/500.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/source-serif-4/700.css";
import "@fontsource/source-serif-4/vietnamese-500.css";
import "@fontsource/source-serif-4/vietnamese-600.css";
import "@fontsource/source-serif-4/vietnamese-700.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/vietnamese-400.css";
import "@fontsource/ibm-plex-sans/vietnamese-500.css";
import "@fontsource/ibm-plex-sans/vietnamese-600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Nền tảng chia sẻ tài liệu Hóa học dành cho học sinh, sinh viên, giáo viên và người tự học. Tài liệu được kiểm duyệt trước khi công khai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="bg-paper font-body text-ink min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
