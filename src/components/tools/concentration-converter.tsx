"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormBanner } from "@/components/ui/form-message";
import { calculateMolarMass, MolarMassError } from "@/lib/chemistry/molar-mass";
import {
  convertConcentration,
  ConcentrationError,
  type ConcentrationResult,
} from "@/lib/chemistry/concentration";

export function ConcentrationConverter() {
  const [formula, setFormula] = useState("H2SO4");
  const [molarity, setMolarity] = useState("");
  const [massPercent, setMassPercent] = useState("98");
  const [density, setDensity] = useState("1.84");
  const [result, setResult] = useState<ConcentrationResult | null>(null);
  const [molarMass, setMolarMass] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);

    let mass: number;
    try {
      mass = calculateMolarMass(formula).totalMass;
      setMolarMass(mass);
    } catch (e) {
      setError(
        e instanceof MolarMassError
          ? e.message
          : "Công thức chất tan không hợp lệ.",
      );
      return;
    }

    try {
      const parsedMolarity = molarity.trim() ? Number(molarity) : undefined;
      const parsedPercent = massPercent.trim()
        ? Number(massPercent)
        : undefined;
      const parsedDensity = density.trim() ? Number(density) : undefined;

      const r = convertConcentration({
        molarMass: mass,
        molarity: parsedMolarity,
        massPercent: parsedPercent,
        density: parsedDensity,
      });
      setResult(r);
    } catch (e) {
      setError(
        e instanceof ConcentrationError
          ? e.message
          : "Có lỗi xảy ra, kiểm tra lại số liệu.",
      );
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="solute">Chất tan (công thức hóa học)</Label>
          <Input
            id="solute"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="Vd: H2SO4, NaOH, NaCl"
            className="font-mono"
          />
          {molarMass !== null && (
            <p className="text-ink-soft mt-1 text-xs">M = {molarMass} g/mol</p>
          )}
        </div>

        <p className="text-ink-soft text-xs">
          Điền đúng 2 trong 3 ô dưới đây — ô còn lại sẽ được tự tính (để trống
          nếu không biết).
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="molarity">Nồng độ mol (mol/L)</Label>
            <Input
              id="molarity"
              type="number"
              step="any"
              value={molarity}
              onChange={(e) => setMolarity(e.target.value)}
              placeholder="CM"
            />
          </div>
          <div>
            <Label htmlFor="massPercent">Nồng độ % khối lượng</Label>
            <Input
              id="massPercent"
              type="number"
              step="any"
              value={massPercent}
              onChange={(e) => setMassPercent(e.target.value)}
              placeholder="C%"
            />
          </div>
          <div>
            <Label htmlFor="density">Khối lượng riêng (g/mL)</Label>
            <Input
              id="density"
              type="number"
              step="any"
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              placeholder="D"
            />
          </div>
        </div>

        <Button type="submit">Chuyển đổi</Button>
      </form>

      {error && (
        <div className="mt-4">
          <FormBanner variant="error">{error}</FormBanner>
        </div>
      )}

      {result && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ResultCard
            label="Nồng độ mol"
            value={result.molarity}
            unit="mol/L"
          />
          <ResultCard label="Nồng độ %" value={result.massPercent} unit="%" />
          <ResultCard
            label="Khối lượng riêng"
            value={result.density}
            unit="g/mL"
          />
          <ResultCard
            label="Nồng độ khối lượng"
            value={result.massConcentration}
            unit="g/L"
          />
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div className="border-line bg-paper-raised rounded-[var(--radius-tile)] border p-4 text-center">
      <p className="font-display text-ink text-xl font-semibold">
        {value === null ? "—" : value}
      </p>
      <p className="text-ink-soft mt-1 font-mono text-[11px]">
        {label} {value !== null && `(${unit})`}
      </p>
    </div>
  );
}
