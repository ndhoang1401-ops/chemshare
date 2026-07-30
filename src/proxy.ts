// Next.js 16 đổi tên quy ước `middleware.ts` → `proxy.ts` (xem
// NEXTJS_NOTES.md mục 1). Toàn bộ logic phân quyền nằm trong callback
// `authorized` ở src/auth.config.ts.
//
// QUAN TRỌNG: KHÔNG import "@/auth" (bản đầy đủ) ở đây, dù runtime của
// proxy là nodejs. Next.js/Turbopack đóng gói proxy.ts thành một bundle
// riêng biệt, và bundle đó không nhét được native addon (vd.
// @node-rs/argon2 mà auth.ts dùng để hash mật khẩu) vào — gây lỗi build
// "Export auth doesn't exist in target module". Xem NEXTJS_NOTES.md mục
// 11 để biết chi tiết.
//
// Cách đúng: tạo một instance NextAuth() RIÊNG, nhẹ, chỉ dùng
// auth.config.ts (không có Credentials provider, không đụng Prisma/
// Argon2/nodemailer) — instance này chỉ cần đọc/giải mã JWT sẵn có để
// biết ai đang đăng nhập, không cần biết provider nào cả. Đây là pattern
// chính thức của Auth.js v5 cho middleware.
import type { NextAuthRequest } from "next-auth";
import NextAuth from "next-auth";
import { NextResponse, type NextFetchEvent } from "next/server";
import { authConfig } from "@/auth.config";
import { isCsrfSafe } from "@/lib/csrf";
import { getClientIp, rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);

const CREDENTIALS_CALLBACK_PATH = "/api/auth/callback/credentials";

/**
 * BUG THẬT đã xác nhận (đọc source `node_modules/next-auth/react.js` +
 * test bằng curl thật — xem NEXTJS_NOTES.md mục 14): `signIn()` phía
 * client, khi gọi với `redirect: false` (đúng cách `LoginForm` dùng),
 * LUÔN chạy `new URL(data.url)` để tách `error`/`code` — BẤT KỂ đăng
 * nhập thành công hay thất bại, không có nhánh nào bỏ qua bước này. Nếu
 * ta chặn request POST tới endpoint này (CSRF hoặc rate limit) mà trả về
 * JSON không có field `url` hợp lệ (như 2 khối JSON generic dùng cho các
 * route khác), `new URL(undefined)` ném lỗi "Failed to construct 'URL':
 * Invalid URL" NGAY TRONG signIn() — vỡ cả trang, không phải lỗi hiển thị
 * bình thường qua `result.error` như luồng sai mật khẩu.
 *
 * → Khi chặn CHÍNH endpoint `/api/auth/callback/credentials`, phải trả
 * đúng hình dạng next-auth mong đợi: `{ url: "<trang login>?error=...
 * &code=..." }` — signIn() sẽ tự parse `code` ra và LoginForm hiển thị
 * đúng qua ERROR_MESSAGES như một lỗi đăng nhập bình thường.
 */
function credentialsCallbackBlockedResponse(
  request: NextAuthRequest,
  {
    code,
    status,
    retryAfterSeconds,
  }: { code: string; status: number; retryAfterSeconds?: number },
): NextResponse {
  const redirectUrl = new URL("/login", request.nextUrl.origin);
  redirectUrl.searchParams.set("error", "CredentialsSignin");
  redirectUrl.searchParams.set("code", code);

  const response = NextResponse.json(
    { url: redirectUrl.toString() },
    { status },
  );
  if (retryAfterSeconds) {
    response.headers.set("Retry-After", String(retryAfterSeconds));
  }
  return response;
}

// lib/csrf.ts và lib/rate-limit.ts chỉ dùng Web API chuẩn (Request/
// Response/Map/setInterval) — không Prisma, không native addon — an toàn
// để import vào proxy.ts (xem NEXTJS_NOTES.md mục 11).
//
// QUAN TRỌNG (đã đọc trực tiếp source next-auth để xác nhận, không đoán
// mò — xem NEXTJS_NOTES.md mục 12): khi gọi `auth(callback)` kiểu này,
// next-auth vẫn chạy callback `authorized` trong auth.config.ts TRƯỚC.
// - Nếu `authorized` trả về một Response (vd. redirect sang /login cho
//   trang cần đăng nhập) → dùng thẳng Response đó, callback bên dưới
//   KHÔNG chạy cho request đó.
// - Nếu `authorized` trả về boolean `true` (mọi request khớp
//   `/api/:path*` đều rơi vào trường hợp này, vì PROTECTED_PREFIXES/
//   ADMIN_PREFIX trong auth.config.ts chỉ khớp đường dẫn trang, không
//   khớp `/api/...`) → callback bên dưới LUÔN được chạy.
// Nhờ vậy logic phân quyền trang (đã có, không đổi) và logic CSRF/rate
// limit cho API (mới) không giẫm lên nhau.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- bắt buộc khai đủ 2 tham số đúng kiểu NextAuthMiddleware để TS chọn đúng overload (xem NEXTJS_NOTES.md mục 12), event không dùng tới trong logic CSRF/rate-limit này
export default auth((request: NextAuthRequest, _event: NextFetchEvent) => {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/")) {
    return undefined;
  }

  const isCredentialsCallbackPost =
    request.method === "POST" && pathname === CREDENTIALS_CALLBACK_PATH;

  // 1. Chống CSRF cho mọi API route có method thay đổi state.
  if (!isCsrfSafe(request)) {
    if (isCredentialsCallbackPost) {
      return credentialsCallbackBlockedResponse(request, {
        code: "csrf_validation_failed",
        status: 403,
      });
    }
    return NextResponse.json(
      {
        error: "csrf_validation_failed",
        message: "Yêu cầu bị từ chối do nguồn gốc (Origin) không khớp.",
      },
      { status: 403 },
    );
  }

  // 2. Rate limit đăng nhập. Endpoint POST /api/auth/callback/credentials
  // do next-auth TỰ SINH bên trong app/api/auth/[...nextauth]/route.ts
  // (không có file route.ts riêng của ta để chèn rate limit trực tiếp),
  // nên xử lý ở đây — nơi duy nhất chặn được request trước khi tới
  // Credentials provider.
  if (isCredentialsCallbackPost) {
    const ip = getClientIp(request);
    const result = rateLimit(`login:${ip}`, RATE_LIMITS.login);
    if (!result.allowed) {
      return credentialsCallbackBlockedResponse(request, {
        code: "rate_limited",
        status: 429,
        retryAfterSeconds: result.retryAfterSeconds,
      });
    }
  }

  return undefined;
});

export const config = {
  matcher: [
    "/profile/:path*",
    "/upload/:path*",
    "/my-documents/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
