import type { Metadata } from "next";
import Link from "next/link";
import { Atom, Calculator, Scale, FlaskConical, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Tiện ích Hóa học",
};

const TOOLS = [
  {
    href: "/tools/periodic-table",
    icon: Atom,
    title: "Bảng tuần hoàn nguyên tố",
    description:
      "Tra cứu đầy đủ 118 nguyên tố: khối lượng nguyên tử, số proton/electron, cấu hình electron.",
  },
  {
    href: "/tools/molar-mass",
    icon: Scale,
    title: "Tính khối lượng mol",
    description:
      "Nhập công thức bất kỳ (kể cả ngoặc lồng nhau, hydrat) — tính khối lượng mol và tỉ lệ % từng nguyên tố.",
  },
  {
    href: "/tools/equation-balancer",
    icon: Calculator,
    title: "Cân bằng phương trình",
    description:
      "Tự động cân bằng phương trình hóa học bất kỳ bằng đại số tuyến tính, kể cả phản ứng oxi hóa khử phức tạp.",
  },
  {
    href: "/tools/concentration-converter",
    icon: FlaskConical,
    title: "Chuyển đổi nồng độ",
    description:
      "Quy đổi giữa nồng độ mol, nồng độ phần trăm và khối lượng riêng dung dịch.",
  },
  {
    href: "/tools/formula-lookup",
    icon: Search,
    title: "Tra cứu công thức",
    description:
      "Gần 150 hợp chất thường gặp — tìm theo tên hóa học, tên thường gọi hoặc công thức.",
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">
        Tiện ích Hóa học
      </h1>
      <p className="text-ink-soft mt-2 max-w-xl text-sm">
        Bộ công cụ tính toán và tra cứu miễn phí, dùng ngay không cần đăng nhập.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="border-line bg-paper-raised hover:border-flame flex gap-4 rounded-[var(--radius-tile)] border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <tool.icon className="text-flame h-6 w-6 shrink-0" />
            <div>
              <h2 className="font-display text-ink text-base font-semibold">
                {tool.title}
              </h2>
              <p className="text-ink-soft mt-1 text-sm">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
