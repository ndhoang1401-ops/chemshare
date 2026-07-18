"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  COMPOUNDS,
  CATEGORY_LABELS,
  searchCompounds,
  type CompoundCategory,
} from "@/lib/chemistry/compounds";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<CompoundCategory, string> = {
  ACID: "border-alert/30 bg-alert/10 text-alert",
  BASE: "border-cobalt/30 bg-cobalt/10 text-cobalt",
  SALT: "border-line bg-paper text-ink-soft",
  OXIDE: "border-amber/30 bg-amber/10 text-amber",
  ORGANIC: "border-success/30 bg-success/10 text-success",
  GAS_ELEMENT: "border-flame/30 bg-flame/10 text-flame",
};

export function FormulaLookup() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CompoundCategory | "ALL">("ALL");

  const results = useMemo(() => {
    const base = query.trim() ? searchCompounds(query) : COMPOUNDS;
    return category === "ALL"
      ? base
      : base.filter((c) => c.category === category);
  }, [query, category]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, tên thường gọi hoặc công thức..."
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-1.5">
          <CategoryChip
            active={category === "ALL"}
            onClick={() => setCategory("ALL")}
          >
            Tất cả
          </CategoryChip>
          {(Object.keys(CATEGORY_LABELS) as CompoundCategory[]).map((c) => (
            <CategoryChip
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
            >
              {CATEGORY_LABELS[c]}
            </CategoryChip>
          ))}
        </div>
      </div>

      <p className="text-ink-soft mt-3 text-xs">{results.length} kết quả</p>

      {results.length === 0 ? (
        <p className="border-line text-ink-soft mt-4 rounded-[var(--radius-tile)] border border-dashed px-4 py-8 text-center text-sm">
          Không tìm thấy hợp chất phù hợp.
        </p>
      ) : (
        <ul className="divide-line border-line mt-3 divide-y rounded-[var(--radius-tile)] border">
          {results.map((c) => (
            <li
              key={c.formula}
              className="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <span className="text-ink w-28 shrink-0 font-mono text-sm font-semibold">
                {c.formula}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-ink text-sm">{c.name}</p>
                {c.commonName && (
                  <p className="text-ink-soft text-xs">{c.commonName}</p>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-[var(--radius-tile)] border px-2 py-0.5 font-mono text-[10px]",
                  CATEGORY_STYLES[c.category],
                )}
              >
                {CATEGORY_LABELS[c.category]}
              </span>
              <Link
                href={`/tools/molar-mass?formula=${encodeURIComponent(c.formula)}`}
                className="text-flame shrink-0 text-xs hover:underline"
              >
                Tính M
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-tile)] border px-2.5 py-1 text-xs transition-colors",
        active
          ? "border-flame bg-flame text-paper-raised"
          : "border-line text-ink-soft hover:border-flame hover:text-flame",
      )}
    >
      {children}
    </button>
  );
}
