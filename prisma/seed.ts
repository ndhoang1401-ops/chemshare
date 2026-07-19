// Dùng chung instance từ lib/prisma.ts (đã cấu hình driver adapter theo
// yêu cầu bắt buộc của Prisma 7 — xem NEXTJS_NOTES.md mục 10) thay vì tự
// `new PrismaClient()` không tham số, vì cách đó sẽ lỗi
// "needs to be constructed with a non-empty, valid PrismaClientOptions".
import { prisma } from "../src/lib/prisma";
import { CATEGORIES } from "../src/lib/constants";
import { hashPassword } from "../src/lib/password";

const DEMO_PASSWORD = "MatKhau123!";

async function main() {
  console.log("🌱 Seeding categories...");
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        tile: category.tile,
        group: category.group,
      },
      create: category,
    });
  }

  console.log("🌱 Seeding tài khoản demo...");
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nguyento.dev" },
    update: {},
    create: {
      email: "admin@nguyento.dev",
      passwordHash,
      displayName: "Quản trị viên Demo",
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "kiemduyet@nguyento.dev" },
    update: {},
    create: {
      email: "kiemduyet@nguyento.dev",
      passwordHash,
      displayName: "Kiểm duyệt viên Demo",
      role: "MODERATOR",
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "thanhvien@nguyento.dev" },
    update: {},
    create: {
      email: "thanhvien@nguyento.dev",
      passwordHash,
      displayName: "Thành viên Demo",
      role: "USER",
      emailVerifiedAt: new Date(),
    },
  });

  // Không seed tài liệu mẫu nữa — hệ thống upload thật đã hoạt động từ
  // Giai đoạn 4, tài liệu demo chỉ gây rối khi test/demo thật cho người
  // dùng cuối. Nếu DB cũ đã từng chạy bản seed có tài liệu demo
  // ("...-demo" trong slug), xóa tay 2 dòng đó qua `npx prisma studio`.

  console.log("✅ Seed hoàn tất.\n");
  console.log("Tài khoản demo (mật khẩu chung: %s):", DEMO_PASSWORD);
  console.log("  - Admin:      admin@nguyento.dev");
  console.log("  - Moderator:  kiemduyet@nguyento.dev");
  console.log("  - User:       thanhvien@nguyento.dev");
  console.log("(admin id: %s)", admin.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
