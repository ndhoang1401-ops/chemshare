import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  FileText,
  Users,
  Download,
  BarChart3,
  FolderKanban,
  ScrollText,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { USER_ROLES } from "@/lib/constants";
import { requireReviewer } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Dashboard quản trị",
};

export default async function AdminDashboardPage() {
  const session = await requireReviewer();
  const isAdmin = session.user.role === USER_ROLES.ADMIN;

  const [pendingCount, documentCount, userCount, downloadAgg] =
    await Promise.all([
      prisma.document.count({ where: { status: "PENDING" } }),
      prisma.document.count(),
      prisma.user.count(),
      prisma.document.aggregate({ _sum: { downloadCount: true } }),
    ]);

  const cards: {
    label: string;
    value: number;
    href: string;
    icon: LucideIcon;
  }[] = [
    {
      label: "Chờ phê duyệt",
      value: pendingCount,
      href: "/admin/approvals",
      icon: ClipboardCheck,
    },
    {
      label: "Tổng tài liệu",
      value: documentCount,
      href: "/admin/documents",
      icon: FileText,
    },
    ...(isAdmin
      ? [
          {
            label: "Người dùng",
            value: userCount,
            href: "/admin/users",
            icon: Users,
          },
        ]
      : []),
    {
      label: "Tổng lượt tải",
      value: downloadAgg._sum.downloadCount ?? 0,
      href: "/admin/stats",
      icon: Download,
    },
  ];

  const sections: {
    href: string;
    title: string;
    description: string;
    icon: LucideIcon;
  }[] = [
    {
      href: "/admin/approvals",
      title: "Hàng chờ phê duyệt",
      description: "Duyệt hoặc từ chối tài liệu mới đăng.",
      icon: ClipboardCheck,
    },
    {
      href: "/admin/documents",
      title: "Quản lý tài liệu",
      description: "Xem toàn bộ tài liệu trong hệ thống, xóa nếu cần.",
      icon: FileText,
    },
    {
      href: "/admin/stats",
      title: "Thống kê tải xuống",
      description: "Tài liệu được tải nhiều nhất, lượt tải theo chuyên đề.",
      icon: BarChart3,
    },
    ...(isAdmin
      ? [
          {
            href: "/admin/users",
            title: "Quản lý người dùng",
            description: "Xem, đổi vai trò, khóa/mở khóa tài khoản.",
            icon: Users,
          },
          {
            href: "/admin/categories",
            title: "Quản lý danh mục",
            description: "Thêm/sửa/xóa chuyên đề Hóa học.",
            icon: FolderKanban,
          },
          {
            href: "/admin/logs",
            title: "Nhật ký hoạt động",
            description: "Lịch sử duyệt tài liệu, đổi vai trò người dùng.",
            icon: ScrollText,
          },
        ]
      : []),
  ];

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-semibold">Dashboard</h1>
      <p className="text-ink-soft mb-8 text-sm">
        Xin chào {session.user.name}.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group border-line bg-paper-raised hover:border-flame rounded-[var(--radius-tile)] border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <card.icon className="text-ink-soft group-hover:text-flame h-4 w-4 transition-colors" />
            <p className="font-display text-ink mt-2 text-2xl font-semibold">
              {card.value}
            </p>
            <p className="text-ink-soft mt-0.5 font-mono text-[11px]">
              {card.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group border-line bg-paper-raised hover:border-flame flex gap-4 rounded-[var(--radius-tile)] border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <section.icon className="text-flame h-5 w-5 shrink-0" />
            <div>
              <h2 className="font-display text-ink text-base font-semibold">
                {section.title}
              </h2>
              <p className="text-ink-soft mt-1 text-sm">
                {section.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
