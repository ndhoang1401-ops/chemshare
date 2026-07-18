import { Suspense } from "react";
import type { Metadata } from "next";
import { MolarMassCalculator } from "@/components/tools/molar-mass-calculator";

export const metadata: Metadata = {
  title: "Tính khối lượng mol",
};

export default function MolarMassPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">
        Tính khối lượng mol
      </h1>
      <p className="text-ink-soft mt-2 max-w-xl text-sm">
        Nhập công thức bất kỳ — hỗ trợ ngoặc lồng nhau và hydrat (nước kết tinh,
        vd. CuSO4.5H2O).
      </p>

      <div className="mt-8">
        <Suspense>
          <MolarMassCalculator />
        </Suspense>
      </div>
    </div>
  );
}
