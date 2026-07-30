/**
 * Rate limiting dạng in-memory, thuật toán "fixed window" — đơn giản,
 * không cần dependency ngoài hay Redis, đủ dùng cho quy mô 1 instance
 * Node hiện tại của dự án.
 *
 * ⚠️ Giới hạn đã biết: state chỉ tồn tại trong bộ nhớ của MỘT process.
 * Nếu sau này scale ra nhiều container/instance chạy song song (load
 * balancer nhiều bản sao app), mỗi instance sẽ đếm riêng — người dùng có
 * thể vượt giới hạn thật gấp N lần (N = số instance) vì request rải ra
 * nhiều process khác nhau. Lúc đó cần chuyển sang store dùng chung (Redis
 * INCR + EXPIRE là lựa chọn phổ biến nhất) — không đụng tới chỗ khác vì
 * `rateLimit()` bên dưới được gọi qua interface hàm thuần, chỉ cần viết
 * lại phần lưu trữ.
 *
 * Dùng globalThis để sống sót qua hot-reload dev (giống pattern
 * lib/prisma.ts) — nếu không, mỗi lần sửa file bất kỳ trong lúc `next dev`
 * chạy sẽ tạo lại Map rỗng, mất hết bộ đếm đang có (vô tình "reset" giới
 * hạn liên tục, khiến rate limit trông như không hoạt động lúc dev).
 */

interface Bucket {
  count: number;
  /** Epoch ms khi cửa sổ đếm hiện tại kết thúc. */
  resetAt: number;
}

const globalForRateLimit = globalThis as unknown as {
  rateLimitStore: Map<string, Bucket> | undefined;
  rateLimitCleanupScheduled: boolean | undefined;
};

const store = globalForRateLimit.rateLimitStore ?? new Map<string, Bucket>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.rateLimitStore = store;
}

/**
 * Dọn các bucket đã hết hạn định kỳ để Map không phình to vô hạn theo
 * thời gian (mỗi IP/user mới đụng 1 endpoint sẽ tạo 1 entry mới). Chỉ
 * lên lịch một lần bất kể module bị load lại bao nhiêu lần (hot-reload).
 */
function scheduleCleanup() {
  if (globalForRateLimit.rateLimitCleanupScheduled) return;
  globalForRateLimit.rateLimitCleanupScheduled = true;

  const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store) {
      if (bucket.resetAt < now) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  // Không giữ process Node sống chỉ vì timer này (quan trọng cho script/
  // test ngắn hạn; không ảnh hưởng server `next start` chạy dài hạn).
  timer.unref?.();
}
scheduleCleanup();

export interface RateLimitConfig {
  /** Độ dài cửa sổ đếm, tính bằng giây. */
  windowSeconds: number;
  /** Số lượt tối đa được phép trong 1 cửa sổ. */
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Chỉ có giá trị khi `allowed = false`. */
  retryAfterSeconds?: number;
}

/**
 * Kiểm tra + ghi nhận 1 lượt request cho `key` theo `config`. Fixed
 * window nghĩa là: lần request đầu tiên trong 1 khoảng `windowSeconds` mở
 * ra 1 cửa sổ mới, mọi request tiếp theo trong cùng cửa sổ dùng chung bộ
 * đếm đó tới khi cửa sổ kết thúc rồi mới reset — đơn giản hơn sliding
 * window/token bucket nhưng đủ chính xác cho mục đích chống spam/brute-
 * force ở quy mô hiện tại (không cần giới hạn tuyệt đối chính xác tới
 * từng mili-giây).
 */
export function rateLimit(
  key: string,
  { windowSeconds, max }: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

/**
 * Cấu hình riêng cho từng endpoint nhạy cảm. Endpoint càng dễ bị lạm dụng
 * (dò mật khẩu, spam tài khoản/email) thì giới hạn càng chặt.
 *
 * `default` đọc từ `.env` (`RATE_LIMIT_WINDOW_SECONDS` /
 * `RATE_LIMIT_MAX_REQUESTS`, xem `.env.example`) — dùng cho các route
 * khác trong tương lai chưa có cấu hình riêng ở đây, không cần sửa code
 * để chỉnh giới hạn mặc định.
 */
export const RATE_LIMITS = {
  /** Đăng nhập — mục tiêu dò mật khẩu (brute-force) phổ biến nhất. */
  login: { windowSeconds: 5 * 60, max: 8 } satisfies RateLimitConfig,
  /** Đăng ký — chặn tạo hàng loạt tài khoản rác / spam email xác thực. */
  register: { windowSeconds: 60 * 60, max: 5 } satisfies RateLimitConfig,
  /** Quên mật khẩu — chặn spam email đặt lại mật khẩu tới 1 hộp thư. */
  forgotPassword: { windowSeconds: 60 * 60, max: 5 } satisfies RateLimitConfig,
  /** Upload — chặn spam tài liệu rác vào hàng chờ duyệt. */
  upload: { windowSeconds: 60 * 60, max: 20 } satisfies RateLimitConfig,
  /** Tải xuống — nới hơn nhiều, đây là thao tác bình thường của người
   * dùng đã đăng nhập, chỉ cần chặn kịch bản script tải hàng loạt. */
  download: { windowSeconds: 10 * 60, max: 60 } satisfies RateLimitConfig,
  default: {
    windowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  } satisfies RateLimitConfig,
} as const;

/**
 * Lấy IP client thật khi có thể, để giới hạn theo TỪNG người thay vì
 * chung 1 bộ đếm cho tất cả.
 *
 * ⚠️ Ứng dụng tự host (không phải Vercel) nên không có sẵn `request.ip`
 * — phải đọc qua header do reverse proxy đặt (`x-forwarded-for` /
 * `x-real-ip`). NẾU app expose thẳng cổng Next.js ra ngoài mà KHÔNG qua
 * reverse proxy nào, các header này sẽ không tồn tại và hàm rơi về
 * "unknown" — lúc đó rate limit áp dụng CHUNG cho mọi người dùng thay vì
 * theo từng người (vẫn chặn được spam hàng loạt, nhưng kém chính xác
 * hơn). → Khi triển khai thật (Giai đoạn 13), đặt Next.js sau Nginx/Caddy
 * và cấu hình chúng set `X-Forwarded-For` để giới hạn theo IP hoạt động
 * đúng như thiết kế.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
