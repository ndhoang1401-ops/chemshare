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

## ⬜ Giai đoạn 1 — Database & Prisma

- Viết `prisma/schema.prisma` đầy đủ (Users, Documents, Categories, Reviews,
  Downloads, Notifications) đúng theo schema tối thiểu trong yêu cầu gốc
- Migration đầu tiên
- `prisma/seed.ts`: seed danh mục từ `CATEGORIES` trong `lib/constants.ts`,
  vài user mẫu (mỗi role), vài tài liệu mẫu

## ⬜ Giai đoạn 2 — Xác thực (Auth)

- Auth.js: đăng ký, đăng nhập, xác thực email, quên/đổi mật khẩu
- Hash mật khẩu bằng Argon2
- Middleware phân quyền theo role — **lưu ý: dùng file `proxy.ts`, không
  phải `middleware.ts`** (xem `NEXTJS_NOTES.md`)

## ⬜ Giai đoạn 3 — Hồ sơ người dùng

- Trang `/profile`: avatar, tên hiển thị, giới thiệu, danh sách tài liệu đã
  đăng, thống kê lượt tải

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
