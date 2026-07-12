# Lộ trình xây dựng — Nguyên Tố

Dự án được xây theo từng giai đoạn nhỏ, giai đoạn sau build tiếp trên nền
code đã có ở giai đoạn trước (không viết lại từ đầu).

## ✅ Giai đoạn 0 — Khởi tạo dự án (hoàn tất)

- [x] Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- [x] ESLint (flat config) + Prettier (kèm `prettier-plugin-tailwindcss`)
- [x] Cấu trúc thư mục đầy đủ cho toàn bộ kiến trúc (route groups, components,
      lib, server, types, hooks, prisma) — mỗi thư mục trống có `README.md`
      ghi chú giai đoạn sẽ lấp đầy nó
- [x] Hệ thống design token (`globals.css`) theo hướng học thuật/tối giản,
      lấy cảm hứng bảng tuần hoàn nguyên tố; hỗ trợ sẵn light/dark mode qua
      class `.dark` (toggle UI sẽ làm ở Giai đoạn 11)
- [x] Font tự lưu trữ qua Fontsource (Source Serif 4 / IBM Plex Sans / IBM
      Plex Mono) — không phụ thuộc gọi mạng tới Google Fonts
- [x] Trang chủ tạm thời (scaffold) hiển thị thương hiệu + chuyên mục +
      tiến độ lộ trình — sẽ được thay bằng trang chủ đầy đủ ở Giai đoạn 7
- [x] `lib/constants.ts` — nguồn dữ liệu gốc cho danh mục Hóa học (dùng lại
      ở seed Prisma, form upload, bộ lọc tìm kiếm, trang quản trị)
- [x] `lib/utils.ts` — hàm `cn()` merge class Tailwind
- [x] `.env.example` khai báo đầy đủ biến môi trường cho mọi giai đoạn
- [x] `docker-compose.dev.yml` — PostgreSQL + Adminer cho môi trường phát triển
- [x] Build production (`next build`) và `eslint .` chạy sạch, không lỗi

## ✅ Giai đoạn 1 — Database & Prisma (hoàn tất)

- [x] `prisma/schema.prisma` đầy đủ: User, Category, Document, Review,
      Download, Notification, VerificationToken (token xác thực email/đặt
      lại mật khẩu — tự viết, không dùng adapter mặc định của Auth.js),
      ActivityLog (chuẩn bị cho nhật ký hoạt động ở Giai đoạn 9)
- [x] Cột DB dùng snake_case qua `@map`/`@@map`, khớp đúng schema tối thiểu
      trong yêu cầu gốc; field Prisma dùng camelCase
- [x] `grade` tách riêng khỏi `category` (lớp học là chiều lọc độc lập,
      không gộp cứng vào 14 danh mục — khớp yêu cầu "Tìm theo lớp" riêng ở
      Giai đoạn 6)
- [x] `prisma/seed.ts`: seed 14 danh mục từ `lib/constants.ts`, 3 tài khoản
      demo (mỗi vai trò), 2 tài liệu mẫu (1 approved, 1 pending)
- [x] `lib/prisma.ts` — Prisma Client singleton (an toàn với hot-reload dev)

> ⚠️ Sandbox dùng để phát triển không có quyền truy cập
> `binaries.prisma.sh` nên **chưa thể chạy** `prisma generate` /
> `migrate dev` tại đây. Đã viết schema cẩn thận bằng tay; bạn cần chạy
> các lệnh này ở máy mình (xem README mục "Bắt đầu"). Nếu gặp lỗi khi
> chạy, gửi lại để mình sửa tiếp.

> 🔧 **Cập nhật:** Prisma 7 đổi kiến trúc (bỏ `url` trong schema, bắt buộc
> `prisma.config.ts` + driver adapter cho `PrismaClient`) — đã sửa toàn bộ
> (`prisma.config.ts` mới, `lib/prisma.ts` dùng `@prisma/adapter-pg`,
> `next.config.ts` thêm cấu hình tương thích Turbopack). Chi tiết ở
> `NEXTJS_NOTES.md` mục 10. Cũng đã sửa `proxy.ts` (export default không
> đúng cú pháp khiến Next.js không nhận diện được).

## ✅ Giai đoạn 2 — Xác thực (Auth) (hoàn tất)

- [x] Auth.js v5 (`next-auth@beta`), Credentials provider, session JWT
- [x] Đăng ký (`/register`) → gửi email xác thực → `/verify-email?token=`
- [x] Đăng nhập (`/login`) — chặn nếu email chưa xác thực
- [x] Quên mật khẩu (`/forgot-password`) → email → `/reset-password?token=`
      — phản hồi giống nhau dù email có tồn tại hay không (chống dò email)
- [x] Hash mật khẩu bằng Argon2id (`@node-rs/argon2`)
- [x] `src/proxy.ts` (đúng quy ước Next.js 16, không phải `middleware.ts`)
      bảo vệ `/profile`, `/upload`, `/my-documents`, `/notifications`
      (yêu cầu đăng nhập) và `/admin/**` (yêu cầu Moderator/Admin)
- [x] `lib/email.ts` — gửi qua SMTP (nodemailer); nếu chưa cấu hình SMTP,
      tự động in nội dung email ra console (tiện test local không cần
      SMTP thật)
- [x] Trang chủ hiển thị trạng thái đăng nhập (tên, vai trò, nút đăng xuất)
      để kiểm tra nhanh toàn bộ luồng

**Đã lùi lại có chủ đích:** "Đổi mật khẩu" (khi đã đăng nhập, khác với
luồng quên mật khẩu) sẽ làm ở **Giai đoạn 3** cùng trang hồ sơ, vì đó là
thao tác thuộc quản lý tài khoản hơn là xác thực.



## ⬜ Giai đoạn 3 — Hồ sơ người dùng

- Trang `/profile`: avatar, tên hiển thị, giới thiệu, danh sách tài liệu đã
  đăng, thống kê lượt tải
- Đổi mật khẩu (khi đã đăng nhập — khác luồng "quên mật khẩu" ở Giai đoạn 2)

## ⬜ Giai đoạn 4 — Upload tài liệu

- API upload PDF/DOCX/PPTX lên Cloudflare R2/S3, kiểm tra loại file và giới
  hạn dung lượng
- Form đăng tải đầy đủ metadata theo yêu cầu gốc

## ⬜ Giai đoạn 5 — Quy trình phê duyệt

- Trạng thái "chờ duyệt" mặc định, API duyệt/từ chối cho Moderator/Admin
- Hệ thống thông báo (bảng `Notifications`)

## ⬜ Giai đoạn 6 — Tìm kiếm

- PostgreSQL Full Text Search theo tiêu đề, từ khóa, chuyên đề, lớp, tác giả

## ⬜ Giai đoạn 7 — Trang công khai

- Trang chủ đầy đủ (thay thế bản scaffold ở Giai đoạn 0)
- Trang chi tiết tài liệu

## ⬜ Giai đoạn 8 — Tải xuống & log

- Đếm lượt tải, ghi log bảng `Downloads`, chỉ user đăng nhập mới tải được

## ⬜ Giai đoạn 9 — Trang quản trị

- Dashboard, quản lý user/tài liệu/danh mục, hàng chờ duyệt, nhật ký hoạt
  động, thống kê

## ⬜ Giai đoạn 10 — Tiện ích Hóa học

- Bảng tuần hoàn, máy tính khối lượng mol, cân bằng phương trình, chuyển đổi
  nồng độ, tra công thức nhanh

## ⬜ Giai đoạn 11 — UI/UX hoàn thiện

- Toggle dark/light mode (next-themes), responsive rà soát lại toàn site,
  tối ưu tốc độ tải

## ⬜ Giai đoạn 12 — Bảo mật

- Rate limiting, chống XSS/CSRF/SQL Injection, rà soát lại toàn bộ upload

## ⬜ Giai đoạn 13 — Đóng gói & triển khai

- `Dockerfile` production, `docker-compose.yml` production (app + db)
- `README.md` cập nhật hướng dẫn triển khai từ đầu đến chạy production
