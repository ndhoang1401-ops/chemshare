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
