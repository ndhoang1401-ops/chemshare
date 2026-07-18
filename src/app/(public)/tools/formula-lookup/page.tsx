import type { Metadata } from "next";
import { FormulaLookup } from "@/components/tools/formula-lookup";
import { COMPOUNDS } from "@/lib/chemistry/compounds";

export const metadata: Metadata = {
  title: "Tra cứu công thức hóa học",
};

export default function FormulaLookupPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">
        Tra cứu công thức hóa học
      </h1>
      <p className="text-ink-soft mt-2 max-w-xl text-sm">
        {COMPOUNDS.length} hợp chất thường gặp trong chương trình phổ thông —
        axit, bazơ, muối, oxit và hợp chất hữu cơ.
      </p>

      <div className="mt-8">
        <FormulaLookup />
      </div>
    </div>
  );
}
