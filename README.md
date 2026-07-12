# Nguyên Tố

Nền tảng chia sẻ tài liệu Hóa học dành cho học sinh, sinh viên, giáo viên và
người tự học. Tài liệu chỉ công khai sau khi được kiểm duyệt viên phê duyệt.

> 🚧 **Đang trong quá trình xây dựng.** Dự án được phát triển theo từng giai
> đoạn — xem [`ROADMAP.md`](./ROADMAP.md) để biết tiến độ và những gì đã/
> chưa hoàn thành. Trạng thái hiện tại cũng hiển thị trực tiếp trên trang chủ.

## Công nghệ

| Lớp          | Lựa chọn                                             |
| ------------ | ----------------------------------------------------- |
| Frontend     | Next.js 16 (App Router), TypeScript, Tailwind CSS v4  |
| Backend      | Next.js Route Handlers (`app/api`)                     |
| Database     | PostgreSQL                                              |
| ORM          | Prisma                                                   |
| Xác thực     | Auth.js (NextAuth)                                       |
| Lưu trữ file | Cloudflare R2 / AWS S3                                   |
| Tìm kiếm     | PostgreSQL Full Text Search                              |
| Triển khai   | Docker + VPS hoặc Vercel                                 |

## Bắt đầu (môi trường phát triển)

Yêu cầu: Node.js ≥ 20.9, npm.

```bash
# 1. Cài dependency
npm install

# 2. Sao chép biến môi trường
cp .env.example .env
```

Mở `.env` và:

- Tạo `AUTH_SECRET`: chạy `openssl rand -base64 32` rồi dán vào
- `DATABASE_URL` cần trỏ tới một PostgreSQL thật — chọn **1 trong 2 cách**:

**Cách A — Docker (khuyến nghị nếu máy bạn chạy Docker được):**

```bash
docker compose -f docker-compose.dev.yml up -d
```

`DATABASE_URL` mặc định trong `.env.example` đã khớp sẵn với compose file
này, không cần sửa gì thêm.

**Cách B — Không cần Docker (Postgres miễn phí trên mây):** nếu Docker
không chạy được trên máy bạn, tạo một database miễn phí ở
[Neon](https://neon.tech) hoặc [Supabase](https://supabase.com) (vài phút,
không cần cài gì), rồi dán connection string họ cung cấp vào
`DATABASE_URL` trong `.env`.

```bash
# 3. Sinh Prisma Client + tạo bảng trong database
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed dữ liệu mẫu (danh mục Hóa học + 3 tài khoản demo + 2 tài liệu mẫu)
npx prisma db seed

# 5. Chạy server phát triển
npm run dev
```

Mở http://localhost:3000.

> ⚠️ Bước 3 cần kết nối mạng ngoài tới `binaries.prisma.sh` để tải engine
> (chỉ lần đầu, hoặc khi đổi phiên bản Prisma) — xem `NEXTJS_NOTES.md`
> mục 9 nếu gặp lỗi 403.

### Tài khoản demo sau khi seed

Mật khẩu chung: `MatKhau123!`

| Vai trò    | Email                     |
| ---------- | -------------------------- |
| Admin      | admin@nguyento.dev          |
| Moderator  | kiemduyet@nguyento.dev       |
| User       | thanhvien@nguyento.dev        |

### Chưa cấu hình SMTP?

Không sao — khi chưa điền `EMAIL_SERVER_HOST` thật trong `.env`, email xác
thực/đặt lại mật khẩu sẽ được **in thẳng ra terminal** đang chạy
`npm run dev` (kèm link để bấm), không cần SMTP thật để test luồng đăng
ký/quên mật khẩu.

### Chưa cấu hình Cloudflare R2 / AWS S3?

Cũng không sao — khi chưa điền đủ 4 biến `STORAGE_*` trong `.env`, file
đăng tải (`/upload`) sẽ tự động lưu vào thư mục `storage-local/` trên đĩa
thay vì R2/S3 thật. Test được toàn bộ luồng đăng tải/tải xuống ngay; khi
nào deploy thật hoặc muốn dùng cloud, điền đủ 4 biến đó vào `.env` là tự
chuyển sang R2/S3, không cần sửa code gì thêm.

## Script

```bash
npm run dev             # chạy dev server (Turbopack)
npm run build           # build production
npm run start            # chạy bản build production
npm run lint              # kiểm tra ESLint
npm run format             # format code bằng Prettier
npm run format:check        # kiểm tra format mà không sửa
npm run db:generate          # sinh Prisma Client sau khi đổi schema
npm run db:migrate            # tạo + áp dụng migration mới (dev)
npm run db:seed                # chạy lại seed dữ liệu mẫu
npm run db:studio                # mở Prisma Studio (xem/sửa dữ liệu qua UI)
```

## Cấu trúc thư mục

```
prisma/           # schema.prisma, migrations, seed.ts (ở gốc dự án — quy ước của Prisma CLI)
src/
  app/
    (public)/     # Trang chủ, tìm kiếm, chi tiết tài liệu, tiện ích Hóa học
    (auth)/       # Đăng ký, đăng nhập, quên/đặt lại mật khẩu, xác thực email
    (dashboard)/  # Hồ sơ, đăng tải, tài liệu của tôi, thông báo
    (admin)/      # Dashboard quản trị, phê duyệt, quản lý người dùng/danh mục
    api/          # Route handlers
  components/     # UI components theo domain (ui, layout, documents, admin, tools, auth)
  lib/            # Tiện ích dùng chung, hằng số, validators (Zod)
  server/         # Lớp service & repository (business logic tách khỏi route handler)
  types/          # Định nghĩa TypeScript dùng chung
  hooks/          # React hooks dùng chung
  auth.ts         # Cấu hình Auth.js đầy đủ (Credentials provider)
  auth.config.ts  # Phần cấu hình Auth.js không đụng Prisma (callback phân quyền)
  proxy.ts        # Middleware phân quyền theo route (quy ước Next.js 16)
```

Mỗi thư mục còn trống hiện có một `README.md` ghi rõ giai đoạn nào sẽ lấp
đầy nó và nội dung dự kiến — xem `ROADMAP.md` để có bức tranh tổng thể.

Xem thêm [`NEXTJS_NOTES.md`](./NEXTJS_NOTES.md) cho các lưu ý quan trọng về
Next.js 16 (breaking changes) cần tuân thủ xuyên suốt dự án.

## Giấy phép

Dự án nội bộ — chưa xác định giấy phép công khai.
