import type { NextConfig } from "next";

// Giai đoạn 12 — Content-Security-Policy.
//
// Đã build + chạy thật `next start` trên 1 project Next.js 16 tối giản để
// soi HTML render ra (không đoán mò): App Router tự chèn nhiều thẻ
// <script> KHÔNG có src (payload RSC dạng `self.__next_f.push(...)`) và
// KHÔNG có nonce khi không bật cơ chế nonce qua proxy. Vì nội dung các
// script này khác nhau mỗi request (không thể dùng CSP hash tĩnh), nếu
// đặt `script-src 'self'` mà thiếu `'unsafe-inline'` hoặc nonce, các
// script này bị trình duyệt chặn → React không hydrate được → toàn bộ
// tương tác (form đăng nhập, nút bấm...) hỏng.
//
// Next.js có hỗ trợ cơ chế nonce qua proxy (tự gắn nonce vào các script
// này), nhưng bắt buộc MỌI trang dùng nonce phải render dynamic (không
// static/cache được nữa — xem NEXTJS_NOTES.md mục 13) — ngược với phần
// cache bằng `revalidateTag` đã cố tình làm ở Giai đoạn 5 và 8. Nên ở đây
// chọn `'unsafe-inline'` cho script-src/style-src (cách chính Next.js đề
// xuất cho app không dùng nonce) — vẫn chặn được nhóm nguy cơ chính của
// CSP: nhúng script/style/frame từ domain lạ, clickjacking, form
// submit/base tag bị chuyển hướng sang domain khác. Nếu sau này muốn
// nonce (chặn cả inline-script injection), cần nâng cấp có chủ đích ở
// Giai đoạn riêng, không lồng vào đây.
const isDev = process.env.NODE_ENV === "development";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' https:;
  font-src 'self';
  connect-src 'self'${isDev ? " ws:" : ""};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${isDev ? "" : "upgrade-insecure-requests;"}
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  // (Giai đoạn 13 ban đầu định self-host bằng Docker, có thêm
  // `output: "standalone"` ở đây — đã bỏ khi chuyển sang Vercel, vì
  // Vercel có cơ chế build/deploy riêng không cần/không tương thích hoàn
  // toàn với standalone mode. Nếu sau này quay lại tự host bằng Docker,
  // thêm lại dòng `output: "standalone"` vào đây. Xem NEXTJS_NOTES.md
  // mục 17.)
  // Prisma 7 + pg dùng native/binary bindings — để Turbopack/webpack tải
  // trực tiếp từ node_modules lúc chạy thay vì cố bundle vào, tránh lỗi
  // "Cannot find module '.prisma/client/default'". Xem NEXTJS_NOTES.md
  // mục "Prisma 7".
  serverExternalPackages: ["@prisma/client", "pg"],
  turbopack: {
    resolveAlias: {
      ".prisma/client/default": "./node_modules/.prisma/client/default.js",
    },
  },
  async headers() {
    return [
      {
        // Áp cho toàn bộ route (trang lẫn API) — không có đánh đổi hiệu
        // năng nào (khác với CSP nonce ở trên), nên không cần thu hẹp
        // phạm vi.
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          // Chặn nhúng site vào iframe domain khác (chống clickjacking).
          // Đặt cả 2 vì frame-ancestors (CSP) mới là chuẩn hiện đại,
          // X-Frame-Options để tương thích trình duyệt/tool cũ hơn.
          { key: "X-Frame-Options", value: "DENY" },
          // Không cho trình duyệt tự đoán MIME type khác Content-Type
          // server trả về (chặn 1 dạng tấn công XSS qua file upload).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Không gửi URL đầy đủ (kèm query string) trong header Referer
          // khi điều hướng sang site khác — tránh rò rỉ thông tin nhạy
          // cảm có thể nằm trong URL (vd. token trong query).
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Tắt các API trình duyệt app không dùng tới.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // HSTS: header này TRÌNH DUYỆT CHỈ TÔN TRỌNG khi request qua
          // HTTPS (bị bỏ qua hoàn toàn trên HTTP) — nên để nguyên ở cả
          // dev (http://localhost) không gây ảnh hưởng gì, chỉ thật sự
          // có tác dụng khi đã triển khai production qua HTTPS (Giai
          // đoạn 13). max-age 1 năm (không phải 2 năm) vì đây là lần đầu
          // bật HSTS — chưa xác nhận HTTPS chạy ổn định lâu dài ở domain
          // thật; có thể tăng lên sau. Chưa thêm `includeSubDomains`/
          // `preload` vì chưa rõ các subdomain khác (nếu có) đã sẵn sàng
          // HTTPS chưa — cân nhắc bật khi triển khai thật.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
