import type { Metadata } from "next";
import { PeriodicTable } from "@/components/tools/periodic-table";

export const metadata: Metadata = {
  title: "Bảng tuần hoàn nguyên tố",
};

export default function PeriodicTablePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">
        Bảng tuần hoàn nguyên tố
      </h1>
      <p className="text-ink-soft mt-2 max-w-xl text-sm">
        Đầy đủ 118 nguyên tố. Bấm vào một ô để xem chi tiết, hoặc gõ tên/ký hiệu
        để tìm nhanh.
      </p>

      <div className="mt-8">
        <PeriodicTable />
      </div>
    </div>
  );
}
