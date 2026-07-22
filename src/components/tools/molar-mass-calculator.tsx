"use client";

import { type FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormBanner } from "@/components/ui/form-message";
import {
  calculateMolarMass,
  MolarMassError,
  type MolarMassResult,
} from "@/lib/chemistry/molar-mass";

const EXAMPLES = [
  "H2O",
  "Ca(OH)2",
  "Al2(SO4)3",
  "CuSO4.5H2O",
  "C6H12O6",
  "K4[Fe(CN)6]",
];

/** Tính kết quả ban đầu (nếu có) — dùng làm lazy initializer cho useState
 * thay vì useEffect, tránh cascading render khi tới từ link "Tính M". */
function computeInitial(formula: string): {
  result: MolarMassResult | null;
  error: string | null;
} {
  if (!formula.trim()) return { result: null, error: null };
  try {
    return { result: calculateMolarMass(formula), error: null };
  } catch (e) {
    return {
      result: null,
      error:
        e instanceof MolarMassError
          ? e.message
          : "Có lỗi xảy ra, kiểm tra lại công thức.",
    };
  }
}

export function MolarMassCalculator() {
  const searchParams = useSearchParams();
  const initialFormula = searchParams.get("formula") ?? "";

  const [formula, setFormula] = useState(initialFormula);
  const [result, setResult] = useState<MolarMassResult | null>(
    () => computeInitial(initialFormula).result,
  );
  const [error, setError] = useState<string | null>(
    () => computeInitial(initialFormula).error,
  );

  function compute(value: string) {
    const { result: r, error: e } = computeInitial(value);
    setResult(r);
    setError(e);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    compute(formula);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <Label htmlFor="formula">Công thức hóa học</Label>
          <Input
            id="formula"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="Vd: Al2(SO4)3 hoặc CuSO4.5H2O"
            className="font-mono"
          />
        </div>
        <Button type="submit">Tính</Button>
      </form>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="text-ink-soft text-xs">Ví dụ:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setFormula(ex);
              compute(ex);
            }}
            className="border-line text-ink-soft hover:border-flame hover:text-flame rounded-[var(--radius-tile)] border px-2 py-0.5 font-mono text-xs"
          >
            {ex}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4">
          <FormBanner variant="error">{error}</FormBanner>
        </div>
      )}

      {result && (
        <div className="border-line bg-paper-raised mt-6 rounded-[var(--radius-tile)] border p-5">
          <p className="text-ink-soft text-sm">Khối lượng mol của</p>
          <p className="text-ink font-mono text-lg font-semibold">
            {result.formula}
          </p>
          <p className="font-display text-flame mt-1 text-3xl font-semibold">
            {result.totalMass}{" "}
            <span className="text-ink-soft text-lg">g/mol</span>
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-line text-ink-soft border-b text-left text-xs">
                  <th className="pb-2 font-mono font-normal">Nguyên tố</th>
                  <th className="pb-2 font-mono font-normal">Số lượng</th>
                  <th className="pb-2 font-mono font-normal">Khối lượng NT</th>
                  <th className="pb-2 font-mono font-normal">Thành phần</th>
                  <th className="pb-2 font-mono font-normal">Tỉ lệ %</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.symbol} className="border-line/50 border-b">
                    <td className="text-ink py-2">
                      {row.symbol}{" "}
                      <span className="text-ink-soft">({row.nameVi})</span>
                    </td>
                    <td className="text-ink-soft py-2 font-mono">
                      ×{row.count}
                    </td>
                    <td className="text-ink-soft py-2 font-mono">
                      {row.atomicMass}
                    </td>
                    <td className="text-ink py-2 font-mono">
                      {row.subtotal} g/mol
                    </td>
                    <td className="text-ink-soft py-2 font-mono">
                      {row.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
