# Ghi chú kỹ thuật — Next.js 16

Dự án dùng **Next.js 16.2.10**, có một số breaking change so với các bản
trước mà mọi giai đoạn sau cần tuân thủ. Ghi lại ở đây để không bị quên khi
viết code ở các giai đoạn tiếp theo.

## 1. `middleware.ts` → `proxy.ts`

Next.js 16 đổi tên quy ước file `middleware` thành `proxy` để làm rõ vai trò
biên mạng/định tuyến.

- File phải đặt tên `proxy.ts` (không phải `middleware.ts`)
- Hàm export phải tên `proxy` (không phải `middleware`)
- Runtime của `proxy` luôn là `nodejs`, **không hỗ trợ Edge runtime**

```ts
// src/proxy.ts
export function proxy(request: Request) {
  /* ... */
}
```

→ Áp dụng ở **Giai đoạn 2** khi viết middleware phân quyền theo role.

> ⚠️ **Đính chính:** "Runtime luôn là nodejs" KHÔNG có nghĩa là import gì
> vào `proxy.ts` cũng được — xem mục 11, `proxy.ts` vẫn được đóng gói
> (bundle) riêng biệt và không nhét được native addon vào, bất kể runtime
> khai báo là gì.

## 2. API bất đồng bộ (Async Request APIs)

Từ Next.js 16, các API sau **bắt buộc phải `await`**, không còn hỗ trợ truy
cập đồng bộ:

- `cookies()`, `headers()`, `draftMode()`
- `params` trong `layout.tsx`, `page.tsx`, `route.ts`
- `searchParams` trong `page.tsx`

```tsx
// page.tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // ...
}
```

```ts
// route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // ...
}
```

→ Áp dụng ở **Giai đoạn 4** (`app/api/**/route.ts`), **Giai đoạn 7**
(`documents/[slug]/page.tsx`), và mọi route động khác.

## 3. `next lint` đã bị loại bỏ

Dùng ESLint CLI trực tiếp (`eslint .`), không dùng `next lint` nữa. Project
đã cấu hình sẵn `npm run lint` → `eslint`.

## 4. `revalidateTag` cần tham số `cacheLife`

```ts
// Trước: revalidateTag('documents')
revalidateTag("documents", "max");
```

→ Áp dụng khi cần revalidate cache ở **Giai đoạn 5** (sau khi duyệt tài
liệu) và **Giai đoạn 8** (sau khi tải xuống, cập nhật lượt tải).

## 5. Ảnh cục bộ có query string

Nếu dùng query string cho ảnh local qua `next/image` (ví dụ cache-busting
avatar), phải khai báo `images.localPatterns` trong `next.config.ts`.

→ Lưu ý khi làm avatar ở **Giai đoạn 3**.

## 6. Font

Dự án **không dùng `next/font/google`** (môi trường build có thể không truy
cập được `fonts.googleapis.com`). Thay vào đó dùng font tự lưu trữ qua các
gói `@fontsource/*`, import trực tiếp file CSS trong `layout.tsx`. Khi cần
thêm weight/subset mới, kiểm tra file có sẵn trong
`node_modules/@fontsource/<font>/` rồi import đúng file đó.

## 7. Node.js tối thiểu

Next.js 16 yêu cầu **Node.js ≥ 20.9.0**. README triển khai (Giai đoạn 13)
cần ghi rõ yêu cầu này.

## 8. Auth.js v5 + `session: { strategy: "jwt" }` — quirk TypeScript

Khi cấu hình `session: { strategy: "jwt" }` cùng lúc với việc mở rộng type
`Session`/`JWT` qua module augmentation (`declare module "next-auth/jwt"`),
TypeScript suy luận SAI kiểu tham số `token` trong callback `callbacks.session`
thành `unknown` thay vì `JWT` đã augment (dù callback `jwt` không bị ảnh
hưởng). Đây là hạn chế của TypeScript khi hợp nhất intersection type + suy
luận ngữ cảnh (contextual inference), không phải lỗi cấu hình.

**Cách khắc phục:** khai type tường minh cho tham số thay vì để TS tự suy
luận:

```ts
// Sai — token bị suy luận thành unknown khi có session.strategy: "jwt"
session({ session, token }) { ... }

// Đúng
session({ session, token }: { session: Session; token: JWT }) { ... }
```

Xem `src/auth.config.ts` để có ví dụ đầy đủ. Nếu thêm callback mới có dùng
`token`/`session`, áp dụng cùng cách khai type tường minh này.

## 9. Prisma CLI cần mạng ngoài tới `binaries.prisma.sh`

`prisma generate`, `migrate`, `format`, `validate` đều cần tải engine
binary từ `binaries.prisma.sh` trong lần chạy đầu (hoặc khi đổi phiên bản
Prisma). Nếu máy/CI của bạn chặn domain này, các lệnh trên sẽ báo lỗi 403.
Chạy ở máy có mạng ngoài bình thường, hoặc mở domain này trong cấu hình
mạng/firewall nếu dùng CI riêng.

## 10. Prisma 7 — breaking change lớn (bắt buộc đọc trước khi đụng Prisma)

Dự án dùng **Prisma 7.8.0**, phiên bản này đổi kiến trúc so với Prisma 5/6:

- **Không còn khai `url` trong `datasource` của `schema.prisma`.** Connection
  string giờ nằm trong **`prisma.config.ts`** ở gốc dự án (file mới, đọc
  bằng `defineConfig`/`env` từ package `prisma/config`).
- **`PrismaClient` bắt buộc phải nhận `adapter`.** Không còn engine kết nối
  nội bộ, không có fallback — `new PrismaClient()` không tham số sẽ throw.
  `src/lib/prisma.ts` tạo `pg.Pool` rồi bọc qua `@prisma/adapter-pg`.
- **Seed command cấu hình trong `prisma.config.ts`** (`migrations.seed`),
  **không phải** field `"prisma"` trong `package.json` nữa (field đó bị
  Prisma 7 lờ đi hoàn toàn, không báo lỗi, chỉ âm thầm không chạy).
- **Generator giữ nguyên `prisma-client-js`** (không đổi sang
  `prisma-client` như docs migrate chính thức gợi ý) và **không khai
  `output`** — vì Next.js 16 mặc định dùng Turbopack, và provider mới gây
  lỗi `Cannot find module '.prisma/client/default'` với Turbopack.
  `next.config.ts` có thêm `serverExternalPackages` +
  `turbopack.resolveAlias` để phòng lỗi này.
- `prisma.config.ts` cần `import "dotenv/config"` ở đầu file — Prisma 7 CLI
  không tự đọc `.env` nữa.

Nếu sau này đổi provider/generator, thêm `output` tùy chỉnh, hoặc gặp lại
lỗi `Cannot find module '.prisma/client/default'`, đọc kỹ 5 điểm trên
trước khi sửa.

## 11. `proxy.ts` KHÔNG được import "@/auth" (bản đầy đủ)

Dù mục 1 nói runtime của `proxy` luôn là `nodejs`, **`proxy.ts` vẫn được
Next.js/Turbopack đóng gói thành một bundle riêng biệt** (tách khỏi phần
còn lại của app) trước khi chạy. Bundle này **không thể nhét native addon
vào** (file `.node` nhị phân, load qua `require()` tới đường dẫn thật
trong `node_modules` — không có cách nào "gộp" vào một chunk JS duy nhất),
bất kể runtime khai báo là gì.

`src/auth.ts` (bản đầy đủ, có Credentials provider) import `lib/prisma.ts`
(Prisma + `pg`) và `lib/password.ts` (`@node-rs/argon2` — native addon).
Import thẳng `@/auth` vào `proxy.ts` gây lỗi build:

```
Export auth doesn't exist in target module
./src/proxy.ts
The export auth was not found in module [project]/src/auth.ts [middleware] (ecmascript).
```

**Cách đúng** (pattern chính thức của Auth.js v5 cho middleware): tạo một
instance `NextAuth()` RIÊNG trong chính `proxy.ts`, chỉ dùng
`auth.config.ts` (không có provider, không đụng Prisma/Argon2/nodemailer):

```ts
// src/proxy.ts (rút gọn — bản đầy đủ có thêm CSRF/rate limit, xem mục 12)
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);
export default auth;
```

Vẫn hoạt động đúng vì `proxy.ts` chỉ cần **đọc/giải mã JWT cookie đã có
sẵn** để biết ai đang đăng nhập + role gì — không cần biết provider nào
cả (provider chỉ cần thiết lúc đăng nhập MỚI, việc đó luôn đi qua
`app/api/auth/[...nextauth]/route.ts` dùng bản đầy đủ `@/auth`).

→ Quy tắc chung: **bất cứ thứ gì import vào `proxy.ts` (kể cả gián tiếp,
qua nhiều lớp import) đều phải edge/bundle-safe** — không Prisma, không
native addon (argon2, sharp, bcrypt...), không SDK cần Node `fs`/network
socket trực tiếp. Nếu cần thêm logic vào `authorized` callback mà logic
đó cần các thứ trên, cân nhắc chuyển logic đó vào route handler/page thay
vì proxy.

## 12. `auth(callback)` vẫn chạy `authorized` callback trước — đọc source thật để xác nhận (Giai đoạn 12)

Giai đoạn 12 cần thêm CSRF-check + rate-limit-đăng-nhập vào `proxy.ts`,
nhưng logic phân quyền trang (mục 11, callback `authorized` trong
`auth.config.ts`) không được đụng vào. Câu hỏi: nếu bọc thêm 1 callback
tùy chỉnh qua `auth((request) => {...})`, callback `authorized` có còn
chạy không, hay bị callback mới THAY THẾ hoàn toàn?

Thay vì đoán, đã đọc thẳng `node_modules/next-auth/lib/index.js` (hàm
`handleAuth`). Thứ tự thực thi thật:

1. Callback `authorized` trong config LUÔN chạy trước tiên.
2. Nếu `authorized` trả về **một `Response`** (vd. `NextResponse.redirect`
   cho trang cần đăng nhập) → dùng thẳng `Response` đó, callback tùy
   chỉnh truyền vào `auth(...)` **KHÔNG chạy** cho request này.
3. Nếu `authorized` trả về **boolean `true`** → callback tùy chỉnh (nếu
   có) **LUÔN được chạy**, với `request.auth` đã có sẵn session.
4. Nếu `authorized` trả về `false` (không có callback tùy chỉnh) → tự
   redirect sang trang đăng nhập như bình thường.

Vì `PROTECTED_PREFIXES`/`ADMIN_PREFIX` trong `auth.config.ts` chỉ khớp
đường dẫn TRANG (`/profile`, `/admin`, ...), không khớp `/api/...`, nên
với mọi request `/api/**`, `authorized` luôn rơi vào nhánh (3) — callback
CSRF/rate-limit trong `proxy.ts` chắc chắn chạy. Với trang cần đăng nhập
mà chưa đăng nhập, rơi vào nhánh (2) — redirect chạy thẳng, không đụng
callback mới (đúng ý muốn, vì CSRF/rate-limit chỉ cần cho API).

**Pattern chuẩn khi cần vừa giữ `authorized`, vừa thêm logic riêng cho
API:**

```ts
const { auth } = NextAuth(authConfig);

export default auth((request: NextAuthRequest, event: NextFetchEvent) => {
  // logic riêng — return undefined để đi tiếp (như NextResponse.next()),
  // hoặc return NextResponse.json(...)/redirect(...) để chặn request.
});
```

Type tham số PHẢI khai tường minh `(request: NextAuthRequest, event:
NextFetchEvent)` — đủ 2 tham số đúng kiểu. Nếu chỉ viết 1 tham số hoặc
để TS tự suy luận, TypeScript có 2 overload khớp cấu trúc cùng lúc
(`AppRouteHandlerFn`-kiểu 2-tham-số và `NextAuthMiddleware`) và có thể
chọn nhầm overload đầu tiên.

→ Áp dụng ở **Giai đoạn 12** (`src/proxy.ts` — CSRF Origin/Host check +
rate limit đăng nhập). Nếu Giai đoạn sau cần thêm logic proxy khác cho
API routes, viết tiếp vào TRONG callback này, không tạo thêm lớp bọc mới.

## 13. CSP (Content-Security-Policy) — `'unsafe-inline'`/`'unsafe-eval'` là bắt buộc, không phải cẩu thả (Giai đoạn 12)

Trước khi chọn CSP, đã build + `next start`/`next dev` THẬT trên 1 project
Next.js 16 tối giản riêng để soi HTML/JS render ra (không đoán mò):

- **`next start` (production):** HTML render ra có ~5 thẻ `<script>`
  KHÔNG có `src` — đây là payload RSC (`self.__next_f.push(...)`), nội
  dung khác nhau mỗi request/trang nên không thể dùng CSP hash tĩnh.
  KHÔNG có `nonce` trừ khi tự dựng cơ chế nonce qua proxy (Next.js chỉ tự
  gắn nonce vào các script này nếu phát hiện pattern `nonce-...` trong
  header CSP của chính response đó).
- **`next dev` (Turbopack):** module runtime của Turbopack gọi thẳng
  `eval(code)` để thực thi từng module (`_eval({code, url, map})` trong
  chunk runtime, có comment `// eslint-disable-next-line no-eval` ngay
  cạnh) — đây là cơ chế nạp module CỐT LÕI của Turbopack dev mode, không
  phải rare edge case. React tự phát hiện `eval` bị chặn và in cảnh báo
  đúng chữ *"React requires eval() in development mode..."* kèm gợi ý
  thêm `unsafe-eval` — nhưng cũng xác nhận *"React will never use eval()
  in production mode"*.

**Hệ quả cho cấu hình CSP (`next.config.ts`):**

- `script-src` bắt buộc có `'unsafe-inline'` (cả dev lẫn prod) — do RSC
  payload script không nonce. Muốn bỏ `'unsafe-inline'` phải làm nonce
  đầy đủ qua `proxy.ts`, nhưng cách đó **bắt buộc mọi trang dùng nonce
  phải render dynamic** (không static/cache được nữa) — xung đột với
  cache bằng `revalidateTag` đã cố tình làm ở Giai đoạn 5 và 8 (mục 4).
  → Không làm nonce trừ khi có quyết định kiến trúc riêng, không lồng
  vào việc "thêm security headers".
- `script-src` cần thêm `'unsafe-eval'` **CHỈ ở dev** (`NODE_ENV !==
  "production"`) — thiếu là `npm run dev` vỡ hoàn toàn (mọi module fail
  load). Production không cần vì Turbopack build ra bundle thường, không
  qua `eval`.
- `connect-src` dev cần thêm `ws:` cho kết nối HMR
  (`new WebSocket(...)`) — dù về lý thuyết `'self'` có thể đã bao gồm
  `ws:` cùng host (theo CSP spec), vẫn khai rõ `ws:` cho chắc (không có
  trình duyệt thật để test lại nhánh này, xem thêm bên dưới).
- `style-src` thêm `'unsafe-inline'` vì `next-themes` (chống nhấp nháy
  theme) tự tạo `<style>`/`<script>` bằng DOM API lúc runtime — có hỗ trợ
  prop `nonce` nhưng project hiện không dùng nonce nên cứ để
  `'unsafe-inline'`, rủi ro thấp hơn nhiều so với `script-src`.

**Giới hạn của phần đã kiểm chứng:** sandbox này KHÔNG tải được Chromium
(`playwright`/`puppeteer` cần tải binary từ domain ngoài allowlist mạng),
nên phần trên chỉ xác nhận được qua HTML/JS THẬT lấy từ `curl`, không
chạy được trong trình duyệt thật để xem console có còn cảnh báo CSP nào
khác không (vd. lazy-loaded script tương lai). Nếu sau này có trình
duyệt thật, nên bật DevTools → tab Console khi chạy `npm run dev` VÀ
`npm run build && npm start` để xác nhận không còn "Refused to
execute/connect..." nào trước khi siết CSP chặt hơn.

→ Áp dụng ở **Giai đoạn 12** (`next.config.ts`). Nếu sau này cần CSP chặt
hơn (bỏ `unsafe-inline` cho script), đọc kỹ mục này trước — đó là việc
lớn hơn "thêm header", cần quyết định đánh đổi dynamic-rendering riêng.

## 14. Bug thật đã sửa: chặn login (CSRF/rate-limit) làm vỡ `signIn()` phía client + `AUTH_URL` ghi đè `request.nextUrl` (Giai đoạn 12)

**Triệu chứng người dùng báo:** bấm đăng nhập → crash toàn trang, lỗi
`Failed to construct 'URL': Invalid URL` ném ra trong `signIn()`.

**Nguyên nhân (xác nhận bằng cách đọc source thật
`node_modules/next-auth/react.js`, không đoán mò):** `signIn()` phía
client, khi gọi với `redirect: false` (đúng cách `LoginForm` dùng), LUÔN
chạy:
```js
const error = new URL(data.url).searchParams.get("error") ?? undefined;
```
bất kể đăng nhập thành công hay thất bại — không có nhánh nào bỏ qua. Ở
Giai đoạn 12, `proxy.ts` chặn request POST tới
`/api/auth/callback/credentials` khi CSRF không khớp hoặc rate limit
vượt ngưỡng, nhưng lúc đó trả về JSON dạng `{error, message}` (giống các
route khác) — KHÔNG có field `url`. `new URL(undefined)` ném lỗi ngay
trong `signIn()`, vỡ cả trang thay vì hiển thị lỗi bình thường qua
`result.error`.

**Cách phát hiện:** test bằng `curl` thật (server dev thật trong sandbox,
không cần Prisma hoạt động vì proxy.ts không đụng Prisma) — gửi POST
`/api/auth/callback/credentials` với `Origin` giả và với 9 lần liên tiếp
để kích hoạt rate limit, xem đúng response JSON trả ra.

**Cách sửa:** khi chặn CHÍNH endpoint `/api/auth/callback/credentials`
(dù vì CSRF hay rate limit), trả về hình dạng next-auth mong đợi:
`{ url: "<origin>/login?error=CredentialsSignin&code=..." }` thay vì
`{error, message}` — xem hàm `credentialsCallbackBlockedResponse` trong
`proxy.ts`. Các route khác (register, forgot-password, upload, download)
KHÔNG cần đổi vì component gọi chúng tự đọc `data.message`/`data.error`
một cách an toàn (có fallback), không tự ý `new URL()` như next-auth làm.

**Phát hiện phụ (quan trọng cho Giai đoạn 13 — triển khai):** trong lúc
debug, phát hiện `request.nextUrl.origin`/`request.url` bên trong
`proxy.ts` **không phản ánh cổng/host thật của request đến**, mà phản
ánh giá trị biến môi trường `AUTH_URL` đã cấu hình (đã test thật: đổi
`AUTH_URL` sang cổng khác, `nextUrl.origin` đổi theo ngay, trong khi
`request.headers.get("host")` vẫn luôn đúng cổng thật). Đây là hành vi
CÓ CHỦ ĐÍCH của Auth.js (ưu tiên origin đã cấu hình/tin cậy hơn Host
header có thể bị giả mạo) — không phải bug, và khớp với cách
`auth.config.ts` (mục "authorized" callback, dùng
`new URL(..., request.url)`) đã làm từ Giai đoạn 2.

→ **Hệ quả cho Giai đoạn 13:** `AUTH_URL` trong `.env` production PHẢI
khớp CHÍNH XÁC domain công khai thật (vd. `https://nguyento.dev`, không
phải `http://localhost:3000` hay tên host nội bộ trong Docker network)
— nếu không, MỌI redirect dựng từ `request.url`/`request.nextUrl` trong
`proxy.ts` VÀ `auth.config.ts` (chuyển hướng sang `/login`, quay lại
trang cũ sau đăng nhập...) sẽ trỏ sai domain một cách khó nhận ra (không
lỗi rõ ràng, chỉ redirect nhầm chỗ). Việc so khớp CSRF (`lib/csrf.ts`)
không bị ảnh hưởng vì nó đọc thẳng header `Host`/`X-Forwarded-Host`, không
qua `nextUrl`.

## 15. Docker `output: "standalone"` + Prisma driver adapter — cách phối hợp đúng (Giai đoạn 13)

Đã fetch trực tiếp Dockerfile mẫu mới nhất từ chính repo Next.js
(`github.com/vercel/next.js/tree/canary/examples/with-docker` — không
dùng lại từ trí nhớ vì mẫu này có thể đổi giữa các version) rồi chỉnh 2
chỗ riêng cho project:

1. **`prisma generate` phải chạy TRƯỚC `next build`** trong stage
   `builder` — code import type từ `@prisma/client`, thiếu bước này
   `next build` lỗi type-check ngay (đã tự gặp lỗi y hệt suốt project vì
   sandbox không chạy được `prisma generate`, xem mục 9 — trong Docker
   build thật thì có mạng, chạy bình thường).
2. `prisma generate` cần `DATABASE_URL` có giá trị (dù không kết nối
   thật) vì `prisma.config.ts` gọi `env("DATABASE_URL")` — Dockerfile
   dùng 1 giá trị GIẢ làm build `ARG` chỉ để bước này qua được;
   `DATABASE_URL` THẬT truyền lúc `docker compose up` (runtime, qua
   `.env.production`), không phải lúc build image.

**Điểm hay của Prisma 7 + driver adapter (không phải binary engine
truyền thống) trong bối cảnh Docker:** `next.config.ts` đã có
`serverExternalPackages: ["@prisma/client", "pg"]` từ trước (Giai đoạn
0/1, lý do gốc là tránh Turbopack cố bundle native binding lúc dev) — hoá
ra cấu hình NÀY cũng chính là thứ đảm bảo `output: "standalone"` copy
đúng toàn bộ package `@prisma/client` đã generate (kể cả file nào nó cần)
vào `.next/standalone` thay vì thử tự phân tích/bundle rồi bỏ sót — không
cần thêm `outputFileTracingIncludes` thủ công như tài liệu Next.js gợi ý
cho các package native khác (`sharp`, `aws-crt`...).

**Phát hiện khác lúc rà lại trước khi viết Dockerfile:** `sharp` — package
bắt buộc để `next/image` optimize ảnh lúc production (không phải lúc
`next dev`, lúc dev Next.js tự dùng cách khác) — **chưa có trong
`package.json`** dù project đã dùng `next/image` (component `Logo`, thêm
ở phần sửa giao diện cùng Giai đoạn 12). Thiếu `sharp` không làm build
lỗi, nhưng `next start`/production sẽ log warning và ảnh không được tối
ưu (nặng hơn, chậm hơn). Đã thêm vào `dependencies`.

→ Đã build thử thật bằng `npm run build` sau khi thêm `output:
"standalone"` — compile/bundle qua trót lọt (37s), chỉ dừng ở lỗi
type-check Prisma đã biết trước, xác nhận `output: "standalone"` tự nó
không gây lỗi gì mới.

## 16. Rate limiting theo IP cần reverse proxy set `X-Forwarded-For` — không tự có khi chạy qua Docker (Giai đoạn 12/13)

Nhắc lại rõ hơn từ comment trong `lib/rate-limit.ts` (mục "getClientIp"):
`docker-compose.yml` ở Giai đoạn 13 chạy Next.js **trực tiếp** trong
container, expose thẳng cổng 3000 — KHÔNG có reverse proxy nào ở giữa
tự đặt header `X-Forwarded-For`. Nghĩa là ngay sau khi deploy bằng
`docker-compose.yml` này (chưa thêm Nginx/Caddy phía trước), rate limit
đăng nhập/đăng ký/quên mật khẩu (Giai đoạn 12) áp dụng CHUNG cho MỌI
người dùng thay vì theo từng IP — vẫn chặn được spam hàng loạt, nhưng 1
người dùng ác ý vẫn có thể vô tình làm rate-limit "dùng hết" cho người
khác dùng chung.

→ Muốn rate-limit đúng theo từng IP: đặt Nginx/Caddy/Cloudflare trước
container `app`, cấu hình set header `X-Forwarded-For` (Nginx:
`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`), rồi trỏ
domain qua reverse proxy đó thay vì thẳng cổng 3000. Việc thêm reverse
proxy nằm NGOÀI phạm vi Giai đoạn 13 (chỉ yêu cầu Dockerfile +
docker-compose.yml + README) — cố tình để lại làm việc riêng nếu cần,
tránh đoán sai domain/chứng chỉ TLS của người triển khai.

## 17. Đổi hướng Docker → Vercel + Neon + R2 (Giai đoạn 13, sau khi xác nhận người dùng không quen quản trị server)

Đã làm xong Docker + Caddy (mục 15-16), nhưng người dùng xác nhận chưa
từng dùng SSH/server, muốn thứ dễ hơn. Chuyển sang Vercel — bỏ hẳn
Docker/Caddy khỏi hướng triển khai chính (vẫn còn trong lịch sử git nếu
sau này cần tự host lại).

**3 điểm code phải đổi khi chuyển nền tảng, đã kiểm chứng qua tìm hiểu
thật (không đoán):**

1. **Bỏ `output: "standalone"` khỏi `next.config.ts`** — setting này
   riêng cho self-host (Docker/VPS), không cần cho Vercel (Vercel có cơ
   chế Build Output API riêng). Có ghi nhận issue thật trên GitHub
   (`vercel/next.js#43654`) về xung đột khi cùng lúc dùng
   `output: standalone` VÀ lệnh `vercel build` — dù project này không rơi
   đúng vào tình huống đó (chỉ dùng 1 trong 2 hướng, không cần cả hai
   cùng lúc), an toàn nhất là bỏ hẳn khi đã quyết định dùng Vercel.

2. **Bắt buộc cấu hình Cloudflare R2 (hoặc S3) — không thể dùng fallback
   lưu file cục bộ `storage-local/` nữa.** Vercel chạy serverless function
   — hệ thống file KHÔNG bền vững giữa các lần gọi hàm/lần deploy (ghi
   file lúc này, request sau có thể chạy trên instance khác không thấy
   file đó, và chắc chắn mất sau lần deploy tiếp theo). `lib/storage.ts`
   đã viết sẵn để tự chuyển sang cloud khi đủ 4 biến `STORAGE_ENDPOINT`/
   `STORAGE_BUCKET`/`STORAGE_ACCESS_KEY_ID`/`STORAGE_SECRET_ACCESS_KEY`
   (đọc thẳng code xác nhận, không đoán) — không cần sửa code, chỉ cần
   điền đủ biến môi trường trên Vercel.

3. **Rate limiting in-memory (Giai đoạn 12, `lib/rate-limit.ts`) kém tin
   cậy hơn trên Vercel serverless** — mỗi lần gọi hàm có thể chạy trên
   instance khác nhau, không chia sẻ chung 1 `Map` trong bộ nhớ như khi
   chạy 1 process Node duy nhất (Docker). Với quy mô nhỏ, Vercel có xu
   hướng tái dùng cùng 1 instance ấm (warm) cho các request liên tiếp gần
   nhau nên vẫn có tác dụng phần nào, nhưng KHÔNG đảm bảo chính xác tuyệt
   đối như khi tự host. Chưa cần sửa ngay (chấp nhận được ở quy mô nhỏ) —
   muốn chính xác tuyệt đối thì cần store dùng chung thật (Vercel KV/
   Upstash Redis), việc riêng nếu cần sau này.

**2 script mới trong `package.json` để Vercel tự động hoá, không cần bước
tay:**

- `postinstall: "prisma generate"` — Vercel tự chạy ngay sau
  `npm install`, đảm bảo `@prisma/client` luôn có type mới nhất mỗi lần
  build mà không cần nhớ chạy `npx prisma generate` riêng (cũng tiện lúc
  dev trên máy — `npm install` giờ tự generate luôn)
- `vercel-build: "prisma migrate deploy && next build"` — Vercel tự ưu
  tiên dùng script này thay vì `build` thường nếu tồn tại (quy ước có sẵn
  của Vercel) — tự áp migration Prisma trước khi build mỗi lần deploy,
  không cần bước "migrate" tách riêng như bản Docker (mục 15)

**Lưu ý quan trọng vẫn giữ nguyên dù đổi nền tảng:** `AUTH_URL` vẫn phải
khớp CHÍNH XÁC domain thật đang dùng (mục 14) — chỉ khác là giờ domain đó
do Vercel cấp (`*.vercel.app`) hoặc domain riêng gắn qua Vercel, không
phải domain tự trỏ DNS vào server như hướng Docker.
