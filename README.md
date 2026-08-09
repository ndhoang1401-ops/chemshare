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
| Lưu trữ file | Vercel Blob                                              |
| Tìm kiếm     | PostgreSQL Full Text Search                              |
| Triển khai   | Vercel                                                    |

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

### Chưa cấu hình Vercel Blob?

Cũng không sao — khi chưa điền `BLOB_READ_WRITE_TOKEN` trong `.env`, file
đăng tải (`/upload`) sẽ tự động lưu vào thư mục `storage-local/` trên đĩa
thay vì Vercel Blob thật. Test được toàn bộ luồng đăng tải/tải xuống
ngay; khi nào deploy thật lên Vercel và kết nối Blob store vào project,
Vercel tự điền biến này, không cần sửa code gì thêm.

## Triển khai (production) — Vercel + Neon

Không cần server riêng, không cần Docker/SSH — chỉ cần 2 tài khoản miễn
phí: [Vercel](https://vercel.com) (host code + lưu file) và
[Neon](https://neon.tech) (database Postgres).

### 1. Tạo database trên Neon

1. Đăng ký/đăng nhập [neon.tech](https://neon.tech), tạo 1 project mới
2. Vào project → **Connection string** → chọn nhánh **Pooled connection**
   (KHÔNG chọn "Direct connection" — pooled mới chịu được nhiều kết nối
   đồng thời như Vercel serverless tạo ra)
3. Copy chuỗi dạng `postgresql://...@ep-xxx-pooler.../neondb?sslmode=require`
   — đây là giá trị `DATABASE_URL` sẽ dùng ở bước 2

### 2. Đưa code lên Vercel

1. Đăng ký/đăng nhập [vercel.com](https://vercel.com) bằng tài khoản
   GitHub
2. **Add New** → **Project** → chọn repo `chemshare` → **Import**
3. ĐỪNG bấm Deploy vội — bấm **Environment Variables**, thêm từng dòng
   (tên biến bên trái, giá trị bên phải):

   | Biến               | Giá trị                                                                                                              |
   | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
   | `DATABASE_URL`      | chuỗi Neon lấy ở bước 1                                                                                               |
   | `AUTH_SECRET`       | chạy `openssl rand -base64 32` (Windows: xem ghi chú dưới)                                                           |
   | `AUTH_URL`          | để tạm `https://ten-project.vercel.app` (Vercel cho biết tên chính xác ngay khi Import xong — sửa lại sau nếu cần)  |
   | `APP_URL`           | giống `AUTH_URL`                                                                                                      |
   | `EMAIL_SERVER_HOST` | (SMTP thật nếu có, không thì để trống — quên/đặt lại mật khẩu qua email sẽ không gửi được)                           |
   | `EMAIL_SERVER_PORT` | `587`                                                                                                                 |
   | `EMAIL_FROM`        | `Nguyên Tố <no-reply@example.com>`                                                                                    |

   Windows không có sẵn `openssl` thì tạo `AUTH_SECRET` bằng:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. Bấm **Deploy**. Vercel tự chạy `npm install` (tự `prisma generate`
   luôn nhờ script `postinstall` đã thêm) rồi build (tự áp migration
   Prisma nhờ script `vercel-build`) — theo dõi log ngay trên trang, mất
   khoảng 1-2 phút

### 3. Bật lưu trữ file — Vercel Blob

Chưa làm bước này thì web vẫn chạy được, chỉ riêng phần **upload file sẽ
không lưu bền** (mất sau lần deploy kế tiếp) — nên làm ngay sau khi deploy
lần đầu thành công:

1. Trong project vừa deploy trên Vercel → tab **Storage** → **Create
   Database** → chọn **Blob**
2. Đặt tên bất kỳ, ở bước chọn quyền truy cập chọn **Private** (không
   chọn Public — tài liệu cần qua kiểm duyệt mới công khai được)
3. Bấm **Connect to Project**, chọn đúng project `chemshare` — Vercel tự
   thêm biến môi trường cần thiết, không cần copy tay
4. Vào tab **Deployments** → bản mới nhất → dấu 3 chấm → **Redeploy** để
   deploy lại với biến vừa thêm

### 4. Sau khi deploy xong

- Vercel cho 1 link dạng `https://ten-project.vercel.app` — vào thử,
  test đăng ký/đăng nhập/upload 1 file xem tải xuống lại được không
- Có domain riêng muốn dùng thay vì `.vercel.app`: vào **Settings** →
  **Domains** trong project Vercel, làm theo hướng dẫn (thêm bản ghi DNS
  tại nơi mua domain) — xong thì QUAY LẠI sửa `AUTH_URL`/`APP_URL` ở
  bước 2 thành domain mới, bấm **Redeploy**

### Cập nhật lên phiên bản mới

```powershell
git push
```

Vercel tự động deploy lại mỗi khi bạn `push` lên GitHub — không cần làm
gì thêm.

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
npm run db:deploy              # áp migration đã có, KHÔNG tạo mới (Vercel tự chạy qua script "vercel-build" mỗi lần deploy, không cần gọi tay)
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
