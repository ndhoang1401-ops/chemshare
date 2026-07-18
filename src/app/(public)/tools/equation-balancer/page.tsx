import type { Metadata } from "next";
import { EquationBalancer } from "@/components/tools/equation-balancer";

export const metadata: Metadata = {
  title: "Cân bằng phương trình hóa học",
};

export default function EquationBalancerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">
        Cân bằng phương trình hóa học
      </h1>
      <p className="text-ink-soft mt-2 max-w-xl text-sm">
        Tự động tính hệ số cân bằng bằng đại số tuyến tính — giải được mọi
        phương trình hợp lệ, kể cả phản ứng oxi hóa khử nhiều chất.
      </p>

      <div className="mt-8">
        <EquationBalancer />
      </div>
    </div>
  );
}
