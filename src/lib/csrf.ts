/**
 * Chống CSRF cho API routes bằng cách so khớp header `Origin` (trình
 * duyệt tự gắn cho mọi request thay đổi state — JavaScript của trang web
 * KHÔNG thể giả mạo header này) với `Host`/`X-Forwarded-Host` của chính
 * request đó.
 *
 * Kịch bản CSRF kinh điển: trang độc hại evil.com tự động submit 1 form/
 * fetch POST tới app này, trình duyệt nạn nhân tự đính kèm cookie session
 * hợp lệ. Nếu server chỉ dựa vào cookie để xác thực (như session JWT ở
 * đây) mà không kiểm tra gì thêm, request giả mạo này trông giống hệt
 * request thật. Header `Origin` trong trường hợp đó sẽ là "evil.com" (nơi
 * script chạy), khác với `Host` là domain thật của app — phát hiện được
 * ngay.
 *
 * Chỉ cần áp dụng cho method THAY ĐỔI STATE (POST/PUT/PATCH/DELETE) — GET/
 * HEAD/OPTIONS không sửa dữ liệu nên không cần (và một số client hợp lệ
 * như Next.js prefetch không phải lúc nào cũng gửi Origin cho GET).
 *
 * Đây là kỹ thuật OWASP khuyến nghị ("Verifying Origin Header") và cũng
 * chính là cách Next.js tự bảo vệ Server Actions nội bộ — áp dụng thêm 1
 * lớp tương tự cho Route Handlers (`app/api/**`) vì Route Handlers KHÔNG
 * có sẵn cơ chế này.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * `true` nếu request được coi là an toàn về mặt CSRF (method an toàn,
 * hoặc Origin/Referer khớp đúng Host của chính request).
 */
export function isCsrfSafe(request: Request): boolean {
  if (SAFE_METHODS.has(request.method)) return true;

  // Ưu tiên X-Forwarded-Host — khi app chạy sau reverse proxy (Nginx/
  // Caddy ở Giai đoạn 13), Host header mà Next.js server nhận được có thể
  // là địa chỉ nội bộ (vd. "app:3000") thay vì domain công khai thật.
  const expectedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!expectedHost) return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === expectedHost;
    } catch {
      // Origin header có giá trị nhưng không parse được thành URL hợp lệ
      // — dữ liệu bất thường, an toàn nhất là coi như không khớp.
      return false;
    }
  }

  // Không có Origin — hầu hết trình duyệt hiện đại LUÔN gửi Origin cho
  // mọi request non-GET (kể cả same-origin), nên thiếu hẳn header này ở
  // 1 request POST/PUT/PATCH/DELETE là dấu hiệu đáng ngờ. Vẫn thử fallback
  // qua Referer (một số client cũ) trước khi từ chối hẳn.
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === expectedHost;
    } catch {
      return false;
    }
  }

  return false;
}
