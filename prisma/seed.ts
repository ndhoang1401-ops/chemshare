import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "../src/lib/constants";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

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

  const member = await prisma.user.upsert({
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

  console.log("🌱 Seeding tài liệu mẫu...");
  const huuCo = await prisma.category.findUniqueOrThrow({
    where: { slug: "hoa-huu-co" },
  });
  const deThi = await prisma.category.findUniqueOrThrow({
    where: { slug: "de-thi" },
  });

  await prisma.document.upsert({
    where: { slug: "tong-hop-ly-thuyet-hoa-huu-co-11-demo" },
    update: {},
    create: {
      slug: "tong-hop-ly-thuyet-hoa-huu-co-11-demo",
      title: "Tổng hợp lý thuyết Hóa hữu cơ 11",
      description:
        "Tài liệu tổng hợp lý thuyết trọng tâm chương trình Hóa hữu cơ lớp 11 (dữ liệu mẫu — chưa có file thật, sẽ thay bằng upload thật ở Giai đoạn 4).",
      keywords: ["hữu cơ", "lý thuyết", "lớp 11"],
      author: "Nguyễn Văn A",
      grade: "GRADE_11",
      categoryId: huuCo.id,
      uploaderId: member.id,
      fileUrl: "https://example.com/demo/huu-co-11.pdf",
      fileName: "huu-co-11-ly-thuyet.pdf",
      fileType: "application/pdf",
      fileSize: 524288,
      status: "APPROVED",
      downloadCount: 12,
      viewCount: 87,
    },
  });

  await prisma.document.upsert({
    where: { slug: "de-thi-hoc-ky-1-hoa-10-demo" },
    update: {},
    create: {
      slug: "de-thi-hoc-ky-1-hoa-10-demo",
      title: "Đề thi học kỳ 1 Hóa 10 (có đáp án)",
      description:
        "Đề thi mẫu học kỳ 1 môn Hóa lớp 10 kèm đáp án chi tiết (dữ liệu mẫu).",
      keywords: ["đề thi", "học kỳ 1", "lớp 10"],
      grade: "GRADE_10",
      categoryId: deThi.id,
      uploaderId: member.id,
      fileUrl: "https://example.com/demo/de-thi-hoa-10-hk1.pdf",
      fileName: "de-thi-hoa-10-hk1.pdf",
      fileType: "application/pdf",
      fileSize: 302112,
      status: "PENDING",
      downloadCount: 0,
      viewCount: 3,
    },
  });

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
