"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormBanner } from "@/components/ui/form-message";
import {
  balanceEquation,
  EquationBalanceError,
  type BalanceResult,
} from "@/lib/chemistry/equation-balancer";

const EXAMPLES = [
  "Fe + O2 -> Fe2O3",
  "KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O",
  "C3H8 + O2 -> CO2 + H2O",
  "Al + HCl -> AlCl3 + H2",
];

export function EquationBalancer() {
  const [equation, setEquation] = useState("");
  const [result, setResult] = useState<BalanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function compute(value: string) {
    if (!value.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    try {
      setResult(balanceEquation(value));
      setError(null);
    } catch (e) {
      setResult(null);
      setError(
        e instanceof EquationBalanceError
          ? e.message
          : "Có lỗi xảy ra, kiểm tra lại phương trình.",
      );
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    compute(equation);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Label htmlFor="equation">Phương trình chưa cân bằng</Label>
        <div className="flex flex-wrap gap-3">
          <Input
            id="equation"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            placeholder="Vd: Fe + O2 -> Fe2O3  (dùng + để nối chất, -> hoặc = để ngăn 2 vế)"
            className="min-w-[240px] flex-1 font-mono"
          />
          <Button type="submit">Cân bằng</Button>
        </div>
      </form>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="text-ink-soft text-xs">Ví dụ:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setEquation(ex);
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
        <div className="border-line bg-paper-raised mt-6 rounded-[var(--radius-tile)] border p-6">
          <p className="text-ink-soft mb-1 text-sm">Phương trình đã cân bằng</p>
          <p className="text-ink font-mono text-xl font-semibold sm:text-2xl">
            {result.balancedEquation}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-ink-soft mb-2 font-mono text-xs tracking-wide uppercase">
                Chất phản ứng
              </p>
              <ul className="space-y-1 text-sm">
                {result.reactants.map((t) => (
                  <li
                    key={t.formula}
                    className="flex justify-between font-mono"
                  >
                    <span>{t.formula}</span>
                    <span className="text-flame">hệ số {t.coefficient}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-ink-soft mb-2 font-mono text-xs tracking-wide uppercase">
                Sản phẩm
              </p>
              <ul className="space-y-1 text-sm">
                {result.products.map((t) => (
                  <li
                    key={t.formula}
                    className="flex justify-between font-mono"
                  >
                    <span>{t.formula}</span>
                    <span className="text-flame">hệ số {t.coefficient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
