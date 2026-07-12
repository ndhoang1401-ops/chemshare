import { auth } from "@/auth";
import {
  CATEGORIES,
  ROLE_LABELS,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/constants";
import { LogoutButton } from "@/components/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

const ROADMAP = [
  { stage: 0, title: "Khởi tạo dự án", done: true },
  { stage: 1, title: "Database & Prisma", done: true },
  { stage: 2, title: "Xác thực (Auth)", done: true },
  { stage: 3, title: "Hồ sơ người dùng", done: true },
  { stage: 4, title: "Upload tài liệu", done: false },
  { stage: 5, title: "Quy trình phê duyệt", done: false },
  { stage: 6, title: "Tìm kiếm", done: false },
  { stage: 7, title: "Trang công khai", done: false },
  { stage: 8, title: "Tải xuống & log", done: false },
  { stage: 9, title: "Trang quản trị", done: false },
  { stage: 10, title: "Tiện ích Hóa học", done: false },
  { stage: 11, title: "UI/UX hoàn thiện", done: false },
  { stage: 12, title: "Bảo mật", done: false },
  { stage: 13, title: "Đóng gói & triển khai", done: false },
] as const;

export default async function Home() {
  const session = await auth();

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
      <header className="flex items-center justify-between py-8">
        <div className="flex items-center gap-3">
          <div className="border-line bg-flame text-paper-raised flex h-11 w-11 flex-col items-center justify-center rounded-[var(--radius-tile)] border">
            <span className="font-mono text-[10px] leading-none opacity-80">
              01
            </span>
            <span className="font-display text-base leading-none font-semibold">
              Nt
            </span>
          </div>
          <div>
            <p className="font-display text-lg leading-none font-semibold">
              {SITE_NAME}
            </p>
            <p className="text-ink-soft text-sm">{SITE_TAGLINE}</p>
          </div>
        </div>

        {session?.user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="hidden text-right text-sm hover:opacity-80 sm:block"
            >
              <span className="text-ink">{session.user.name}</span>
              <span className="text-ink-soft">
                {" "}
                · {ROLE_LABELS[session.user.role] ?? session.user.role}
              </span>
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Đăng nhập
            </Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>
              Đăng ký
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        <section className="grid gap-10 py-10 sm:py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <h1 className="font-display text-4xl leading-tight font-semibold text-balance sm:text-5xl">
              Nơi lưu trữ và chia sẻ tài liệu Hóa học đã qua kiểm duyệt.
            </h1>
            <p className="text-ink-soft mt-5 max-w-lg text-base leading-relaxed">
              Dành cho học sinh, sinh viên, giáo viên và người tự học. Mỗi tài
              liệu đăng tải đều được kiểm duyệt viên xem xét trước khi công
              khai, đảm bảo chất lượt nội dung cho cộng đồng học Hóa.
            </p>
            <p className="border-flame text-ink-soft mt-8 border-l-2 pl-4 font-mono text-xs leading-relaxed">
              Đăng ký/đăng nhập đã hoạt động (Giai đoạn 2). Upload, duyệt bài và
              trang chủ đầy đủ sẽ lần lượt xuất hiện ở các giai đoạn tiếp theo —
              xem tiến độ bên dưới.
            </p>
          </div>

          <div>
            <p className="text-ink-soft mb-3 font-mono text-xs tracking-wide uppercase">
              Chuyên mục sẽ có mặt trên nền tảng
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {CATEGORIES.map((category, index) => (
                <div
                  key={category.slug}
                  className="group border-line bg-paper-raised hover:border-flame flex aspect-square flex-col items-center justify-center gap-0.5 rounded-[var(--radius-tile)] border transition-colors"
                  title={category.name}
                >
                  <span className="text-ink-soft font-mono text-[9px] leading-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-sm leading-none font-semibold">
                    {category.tile}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-line border-t py-10">
          <p className="text-ink-soft mb-5 font-mono text-xs tracking-wide uppercase">
            Lộ trình xây dựng
          </p>
          <ol className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {ROADMAP.map((item) => (
              <li
                key={item.stage}
                className="border-line/60 flex items-baseline gap-3 border-b py-2 text-sm"
              >
                <span
                  className={`font-mono text-xs ${
                    item.done ? "text-flame" : "text-ink-soft"
                  }`}
                >
                  {String(item.stage).padStart(2, "0")}
                </span>
                <span className={item.done ? "text-ink" : "text-ink-soft"}>
                  {item.title}
                </span>
                {item.done && (
                  <span className="text-flame ml-auto font-mono text-[10px]">
                    hoàn tất
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-line text-ink-soft border-t py-6 text-xs">
        <p>
          {SITE_NAME} · Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma.
        </p>
      </footer>
    </div>
  );
}
