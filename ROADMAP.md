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

## ✅ Giai đoạn 3 — Hồ sơ người dùng (hoàn tất)

- [x] `(dashboard)/layout.tsx` — header dùng chung (brand, avatar, tên,
      nút đăng xuất) cho các trang cần đăng nhập
- [x] Trang `/profile`: avatar (URL tự nhập, fallback chữ cái đầu tên khi
      chưa có ảnh), tên hiển thị, vai trò, giới thiệu ngắn
- [x] Thống kê: số tài liệu đã đăng, tổng lượt xem, tổng lượt tải
- [x] Danh sách tài liệu đã đăng kèm trạng thái duyệt
      (`components/documents/document-status-badge.tsx` — dùng lại được ở
      Giai đoạn 5/7/9)
- [x] Form chỉnh sửa hồ sơ (`PATCH /api/profile`)
- [x] Đổi mật khẩu khi đã đăng nhập (`POST /api/profile/change-password`)
      — yêu cầu đúng mật khẩu hiện tại, mật khẩu mới phải khác mật khẩu cũ
- [x] `components/ui/avatar.tsx`, `components/ui/textarea.tsx` — bổ sung
      vào bộ UI dùng chung



## ✅ Giai đoạn 4 — Upload tài liệu (hoàn tất)

- [x] `lib/storage.ts`: lớp trừu tượng lưu trữ — dùng Cloudflare R2/AWS S3
      (qua `@aws-sdk/client-s3`, cùng SDK cho cả hai vì R2 tương thích API
      S3) khi đã cấu hình đủ biến `STORAGE_*`; **tự động rơi về lưu đĩa cục
      bộ** (`storage-local/`) khi chưa cấu hình — test được toàn bộ luồng
      upload/tải ngay, không cần tài khoản R2/S3 trước
- [x] `app/api/files/[...key]/route.ts` — phục vụ file ở chế độ local,
      yêu cầu đăng nhập + chặn path traversal
- [x] `POST /api/documents`: validate metadata (Zod), **kiểm tra loại file
      thật qua magic bytes/cấu trúc OOXML** bằng thư viện `file-type` (so
      khớp nội dung thật, không tin đuôi file hay Content-Type client gửi
      — cả hai đều dễ giả mạo), giới hạn dung lượng theo
      `UPLOAD_MAX_SIZE_MB`, tạo `Document` với `status = PENDING`
- [x] `lib/slug.ts` — sinh slug từ tiêu đề tiếng Việt có dấu + hậu tố ngẫu
      nhiên (dùng cho URL tài liệu ở Giai đoạn 7)
- [x] Trang `/upload`: form đầy đủ (tiêu đề, mô tả, từ khóa, chuyên đề,
      lớp học, tác giả, file), hiện trạng thái "đang chờ duyệt" sau khi gửi
- [x] `components/ui/select.tsx` bổ sung vào bộ UI dùng chung
- [x] Nav "Hồ sơ / Đăng tải" trong `(dashboard)/layout.tsx`

**Quyết định thiết kế:** `previewUrl` chưa được set ở giai đoạn này — xem
trước PDF (Giai đoạn 7) sẽ dùng thẳng URL tải của file gốc qua iframe;
DOCX/PPTX chưa có xem trước (cần dịch vụ convert riêng, ngoài phạm vi dự
án hiện tại).

## ✅ Giai đoạn 5 — Quy trình phê duyệt (hoàn tất)

- [x] `(admin)/layout.tsx` — kiểm tra vai trò Moderator/Admin (phòng vệ
      thêm ngoài `proxy.ts`), header + nav riêng cho khu quản trị
- [x] Trang `/admin/approvals`: danh sách tài liệu "chờ duyệt", kèm link
      "Xem file" (tải trực tiếp từ storage để kiểm duyệt viên xem trước
      khi quyết định — tự dùng lại `lib/storage.ts` từ Giai đoạn 4)
- [x] `POST /api/documents/[id]/review`: tạo `Review`, cập nhật
      `Document.status`, tạo `Notification` cho người đăng — cả 3 trong
      1 transaction (`prisma.$transaction`) để đảm bảo nhất quán
- [x] Bắt buộc ghi lý do khi từ chối (Zod discriminated union: `APPROVED`
      không cần note, `REJECTED` bắt buộc note ≥ 5 ký tự)
- [x] Chặn duyệt lại tài liệu đã xử lý (chỉ thao tác được khi đang
      `PENDING`, tránh 2 kiểm duyệt viên duyệt trùng)
- [x] `lib/activity-log.ts` — bắt đầu ghi nhật ký hoạt động
      (`document.approve`/`document.reject`) cho trang quản trị hiển thị ở
      Giai đoạn 9; ghi log lỗi không làm hỏng thao tác chính
- [x] Trang `/notifications`: danh sách thông báo, bấm để đánh dấu đã đọc,
      nút "Đánh dấu tất cả đã đọc"
- [x] Nav dashboard: thêm mục "Thông báo" (kèm số chưa đọc) và "Kiểm
      duyệt" (chỉ hiện với Moderator/Admin)

## ✅ Giai đoạn 6 — Tìm kiếm (hoàn tất)

- [x] `lib/search.ts`: PostgreSQL Full Text Search theo tiêu đề/từ khóa/tác
      giả/mô tả (config `simple` — Postgres không có dictionary tiếng Việt
      sẵn nên không dùng `english` để tránh stemming sai ngữ nghĩa), lọc
      thêm theo chuyên đề và lớp. **Đã cài Postgres ngay trong sandbox và
      chạy thử câu SQL thật** (không chỉ đọc code) với dữ liệu tiếng Việt
      có dấu — xác nhận đúng kết quả, đúng thứ tự xếp hạng, loại đúng tài
      liệu chưa duyệt.
- [x] `components/documents/search-form.tsx` — form GET thuần, không cần
      JS, dùng chung cho trang chủ và trang kết quả
- [x] Trang `/search`: kết quả + phân trang, giữ nguyên bộ lọc qua URL

## ✅ Giai đoạn 7 — Trang công khai (hoàn tất)

- [x] `app/(public)/layout.tsx` — header/footer dùng chung; **di chuyển
      trang chủ từ `app/page.tsx` vào `app/(public)/page.tsx`** để dùng
      chung layout này (không đổi URL, `/` vẫn là `/`)
- [x] Trang chủ đầy đủ: thanh tìm kiếm lớn, chuyên mục phổ biến (ô nguyên
      tố kèm số tài liệu thật), tài liệu mới nhất, tài liệu nổi bật,
      thống kê hệ thống — thay thế bản scaffold từ Giai đoạn 0
- [x] Trang chi tiết `/documents/[slug]`: đầy đủ thông tin, xem trước PDF
      (iframe), tài liệu liên quan (cùng chuyên đề); tài liệu chưa duyệt
      trả 404 cho người không liên quan (chỉ chủ tài liệu + Moderator/
      Admin xem được) thay vì 403 — tránh lộ sự tồn tại
      của tài liệu chưa công khai
- [x] Tăng `viewCount` mỗi lượt xem trang chi tiết

## ✅ Giai đoạn 8 — Tải xuống & log (phần lõi đã hoàn tất cùng Giai đoạn 7)

Trang chi tiết tài liệu (Giai đoạn 7) cần nút tải xuống hoạt động thật nên
phần lõi của giai đoạn này đã được làm luôn:

- [x] `POST /api/documents/[id]/download`: yêu cầu đăng nhập, kiểm tra
      quyền xem (tài liệu đã duyệt, hoặc là chủ tài liệu/Moderator/Admin),
      tăng `downloadCount` + tạo bản ghi `Download` trong 1 transaction,
      trả về URL tải thật
- [x] `components/documents/download-button.tsx` — ẩn/disable khi chưa
      đăng nhập, gọi API rồi điều hướng tới URL tải
- [x] Sửa lại `app/api/files/[...key]` (route phục vụ file chế độ local
      từ Giai đoạn 4): bỏ yêu cầu đăng nhập bắt buộc ở route phục vụ —
      khớp đúng ngữ nghĩa với presigned URL thật (quyền quyết định ở NƠI
      GỌI `getDownloadUrl()`, không phải ở bước phục vụ file)

**Còn lại cho phần hoàn thiện sau (không chặn dùng được):** giới hạn tốc
độ tải (rate limiting) thuộc Giai đoạn 12 — Bảo mật.

## ✅ Giai đoạn 9 — Trang quản trị (hoàn tất)

> ⚠️ **Cần migration mới:** thêm field `isActive` vào `User` (khóa tài
> khoản) — chạy `npx prisma migrate dev` sau khi cập nhật code.

- [x] Phân quyền trong khu quản trị: **Moderator + Admin** xem được
      Dashboard/Hàng chờ phê duyệt/Tài liệu/Thống kê; **chỉ Admin** vào
      được Quản lý người dùng/Quản lý danh mục/Nhật ký hoạt động —
      `lib/auth-guards.ts` (`requireReviewer`/`requireAdmin`)
- [x] `/admin` — Dashboard: số liệu tổng quan + link nhanh tới từng mục
      (nội dung khác nhau theo vai trò)
- [x] `/admin/users` (Admin) — xem, đổi vai trò, khóa/mở khóa tài khoản;
      chặn tự đổi vai trò/tự khóa chính mình
- [x] `/admin/documents` (Moderator + Admin xem, Admin xóa) — xem toàn bộ
      tài liệu mọi trạng thái, lọc theo trạng thái, xóa (dọn cả file trên
      storage)
- [x] `/admin/categories` (Admin) — CRUD chuyên đề Hóa học; chặn xóa danh
      mục còn tài liệu (kiểm tra ở tầng ứng dụng + có `onDelete: Restrict`
      ở tầng DB làm lớp bảo vệ thứ hai — **đã test cascade/restrict thật
      bằng Postgres**, không chỉ đọc code)
- [x] `/admin/logs` (Admin) — nhật ký hoạt động (ghi từ Giai đoạn 5), dịch
      action sang tiếng Việt kèm chi tiết
- [x] `/admin/stats` (Moderator + Admin) — top tài liệu tải nhiều nhất,
      lượt tải theo chuyên đề, lượt tải gần đây
- [x] Tài khoản bị khóa không đăng nhập được (`auth.ts`), thông báo lỗi rõ
      ràng ở form đăng nhập

**Đã test kỹ bằng Postgres thật trong sandbox** (không chỉ đọc code):
dịch toàn bộ schema (6 enum, 8 bảng) sang DDL và áp thử — không lỗi cú
pháp; chèn dữ liệu thật rồi xác nhận: xóa User cascade đúng xuống
Document → Review/Download, xóa User được tham chiếu trong ActivityLog
đúng thành NULL (giữ log), xóa Category còn Document bị chặn đúng bởi
`onDelete: Restrict`.

**Giới hạn đã biết:** tài khoản bị khóa vẫn dùng được session JWT hiện có
tới khi hết hạn/đăng xuất (không có DB re-check theo thời gian thực trong
`proxy.ts` — xem NEXTJS_NOTES.md mục 11 vì sao proxy.ts không thể đụng
Prisma). Chỉ chặn được ở lần đăng nhập tiếp theo.

## ✅ Giai đoạn 10 — Tiện ích Hóa học (hoàn tất)

Toàn bộ thuật toán đã test kỹ bằng script thật trong sandbox trước khi
lắp vào giao diện — không phải "cho có", giải được input tùy ý trong
phạm vi hóa học phổ thông/đại học đại cương:

- [x] `lib/chemistry/elements.ts` — đầy đủ **118 nguyên tố** (nguồn:
      Bowserinator/Periodic-Table-JSON, đối chiếu tên tiếng Việt qua
      Wikipedia), gồm khối lượng nguyên tử, cấu hình electron, số lớp,
      nhóm/chu kỳ, vị trí lưới thật
- [x] `lib/chemistry/formula-parser.ts` — parser đệ quy thật (không phải
      regex chắp vá), xử lý ngoặc lồng nhau nhiều cấp
      (`K4[Fe(CN)6]`, `[Cu(NH3)4]SO4`) và hydrat (`CuSO4.5H2O`) — **đã
      test 24 công thức thật + 4 trường hợp lỗi**, tất cả đúng
- [x] `lib/chemistry/molar-mass.ts` — **đã đối chiếu 12 công thức với giá
      trị thật** (H2O=18.015, NaCl=58.44, CuSO4.5H2O=249.68...), khớp
      chính xác; validate ký hiệu nguyên tố không tồn tại
- [x] `lib/chemistry/equation-balancer.ts` — cân bằng bằng **đại số tuyến
      tính thật** (Gaussian elimination trên phân số chính xác BigInt, tìm
      null space — không hard-code mẫu nào). **Đã test 13 phản ứng thật**
      kể cả phản ứng oxi hóa khử khó (`KMnO4 + HCl`), tất cả ra đúng hệ số
      chuẩn sách giáo khoa
- [x] `lib/chemistry/concentration.ts` — chuyển đổi nồng độ mol ↔ % khối
      lượng ↔ khối lượng riêng, giải được theo bất kỳ chiều nào (đủ 2/3
      dữ kiện). Đã test khớp ví dụ kinh điển H2SO4 98% D=1.84 → 18.4M
- [x] `lib/chemistry/compounds.ts` — **149 hợp chất** thường gặp (axit,
      bazơ, muối, oxit, hữu cơ) kèm tên thường gọi tiếng Việt; đã test
      toàn bộ parse được + không trùng lặp
- [x] 5 trang công cụ đầy đủ tại `/tools/*` + trang chỉ mục `/tools`,
      công khai không cần đăng nhập
- [x] Bảng tuần hoàn tương tác: lưới đúng vị trí thật, màu theo 10 nhóm,
      click xem chi tiết, tìm kiếm theo tên/ký hiệu/số hiệu

**Đã tranh thủ nâng cấp giao diện luôn (theo yêu cầu):** thêm
`components/layout/nav-link.tsx` (active state + icon) cho nav dashboard
và admin, thêm icon cho toàn bộ card Dashboard quản trị, đồng bộ
shadow/hiệu ứng hover-lift cho mọi loại card trong site (tài liệu, chuyên
mục, tiện ích). Việc nâng cấp UI/UX toàn diện hơn (responsive rà soát kỹ,
dark mode, tối ưu tốc độ) vẫn nằm ở Giai đoạn 11 như kế hoạch.

## ⬜ Giai đoạn 11 — UI/UX hoàn thiện

- Toggle dark/light mode (next-themes), responsive rà soát lại toàn site,
  tối ưu tốc độ tải

## ⬜ Giai đoạn 12 — Bảo mật

- Rate limiting, chống XSS/CSRF/SQL Injection, rà soát lại toàn bộ upload

## ⬜ Giai đoạn 13 — Đóng gói & triển khai

- `Dockerfile` production, `docker-compose.yml` production (app + db)
- `README.md` cập nhật hướng dẫn triển khai từ đầu đến chạy production
