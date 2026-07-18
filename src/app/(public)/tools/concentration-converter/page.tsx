import type { Metadata } from "next";
import { ConcentrationConverter } from "@/components/tools/concentration-converter";

export const metadata: Metadata = {
  title: "Chuyển đổi nồng độ dung dịch",
};

export default function ConcentrationConverterPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">
        Chuyển đổi nồng độ dung dịch
      </h1>
      <p className="text-ink-soft mt-2 max-w-xl text-sm">
        Quy đổi giữa nồng độ mol, nồng độ phần trăm khối lượng và khối lượng
        riêng — dựa trên công thức C<sub>M</sub> = (10 × D × C%) / M.
      </p>

      <div className="mt-8">
        <ConcentrationConverter />
      </div>
    </div>
  );
}
