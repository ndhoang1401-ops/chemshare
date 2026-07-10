import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="border-line bg-paper-raised flex h-16 w-16 flex-col items-center justify-center rounded-[var(--radius-tile)] border">
        <span className="text-ink-soft font-mono text-[10px] leading-none">
          404
        </span>
        <span className="font-display text-xl leading-none font-semibold">
          ?
        </span>
      </div>
      <h1 className="font-display mt-6 text-2xl font-semibold">
        Không tìm thấy trang
      </h1>
      <p className="text-ink-soft mt-2 text-sm">
        Trang bạn tìm không tồn tại, hoặc chưa được xây dựng ở giai đoạn hiện
        tại.
      </p>
      <Link
        href="/"
        className="border-line hover:border-flame hover:text-flame mt-6 rounded-[var(--radius-tile)] border px-4 py-2 text-sm transition-colors"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
