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

Yêu cầu: Node.js ≥ 20.9, npm, Docker (để chạy PostgreSQL local).

```bash
# 1. Cài dependency
npm install

# 2. Sao chép biến môi trường
cp .env.example .env
# → mở .env và điền giá trị (DATABASE_URL mặc định đã khớp sẵn với
#   docker-compose.dev.yml bên dưới, các biến khác sẽ cần từ Giai đoạn 2 trở đi)

# 3. Chạy PostgreSQL local
docker compose -f docker-compose.dev.yml up -d

# 4. Chạy server phát triển
npm run dev
```

Mở http://localhost:3000.

> Lệnh `npx prisma migrate dev` và `npx prisma db seed` sẽ được bổ sung vào
> quy trình này ở **Giai đoạn 1 — Database & Prisma**.

## Script

```bash
npm run dev             # chạy dev server (Turbopack)
npm run build           # build production
npm run start            # chạy bản build production
npm run lint              # kiểm tra ESLint
npm run format             # format code bằng Prettier
npm run format:check        # kiểm tra format mà không sửa
```

## Cấu trúc thư mục

```
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
  prisma/         # schema.prisma, migrations, seed
```

Mỗi thư mục còn trống hiện có một `README.md` ghi rõ giai đoạn nào sẽ lấp
đầy nó và nội dung dự kiến — xem `ROADMAP.md` để có bức tranh tổng thể.

Xem thêm [`NEXTJS_NOTES.md`](./NEXTJS_NOTES.md) cho các lưu ý quan trọng về
Next.js 16 (breaking changes) cần tuân thủ xuyên suốt dự án.

## Giấy phép

Dự án nội bộ — chưa xác định giấy phép công khai.
