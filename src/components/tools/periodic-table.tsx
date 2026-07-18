"use client";

import { useMemo, useState } from "react";
import { ELEMENTS, type ChemicalElement } from "@/lib/chemistry/elements";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  "Kim loại kiềm": "#e0784f",
  "Kim loại kiềm thổ": "#e0a24f",
  "Kim loại chuyển tiếp": "#6f9bd6",
  "Kim loại sau chuyển tiếp": "#7cb0a3",
  "Á kim": "#a9a851",
  "Phi kim đa nguyên tử": "#6bb36f",
  "Phi kim lưỡng nguyên tử": "#4fb894",
  "Khí hiếm": "#a67cc9",
  "Họ Lantan": "#d17ca8",
  "Họ Actini": "#b06cc4",
};

function colorFor(category: string): string {
  const base = category.replace(" (dự đoán)", "");
  return CATEGORY_COLORS[base] ?? "#9aa39d";
}

export function PeriodicTable() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ChemicalElement | null>(null);

  const matchedNumbers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      ELEMENTS.filter(
        (e) =>
          e.symbol.toLowerCase() === q ||
          e.name.toLowerCase().includes(q) ||
          e.nameVi.toLowerCase().includes(q) ||
          String(e.number) === q,
      ).map((e) => e.number),
    );
  }, [query]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, ký hiệu hoặc số hiệu nguyên tử..."
          className="max-w-xs"
        />
        <div className="text-ink-soft flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
          {Object.entries(CATEGORY_COLORS).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: color }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: "repeat(18, minmax(2.75rem, 1fr))",
            gridTemplateRows: "repeat(10, minmax(2.75rem, auto))",
            minWidth: "56rem",
          }}
        >
          {ELEMENTS.map((element) => {
            const dimmed =
              matchedNumbers !== null && !matchedNumbers.has(element.number);
            const highlighted =
              matchedNumbers !== null && matchedNumbers.has(element.number);
            return (
              <button
                key={element.number}
                type="button"
                onClick={() => setSelected(element)}
                style={{
                  gridColumn: element.xpos,
                  gridRow: element.ypos,
                  backgroundColor: colorFor(element.category),
                }}
                className={cn(
                  "text-paper-raised flex flex-col items-center justify-center rounded-[3px] p-0.5 transition-opacity",
                  dimmed && "opacity-20",
                  highlighted && "ring-ink ring-2 ring-offset-1",
                  selected?.number === element.number &&
                    "ring-ink ring-2 ring-offset-1",
                )}
                title={`${element.nameVi} (${element.name})`}
              >
                <span className="font-mono text-[8px] leading-none opacity-80">
                  {element.number}
                </span>
                <span className="font-display text-xs leading-none font-bold sm:text-sm">
                  {element.symbol}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <ElementDetail element={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function ElementDetail({
  element,
  onClose,
}: {
  element: ChemicalElement;
  onClose: () => void;
}) {
  return (
    <div className="border-line bg-paper-raised mt-6 rounded-[var(--radius-tile)] border p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="text-paper-raised flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[var(--radius-tile)]"
            style={{ backgroundColor: colorFor(element.category) }}
          >
            <span className="font-mono text-[10px] leading-none opacity-80">
              {element.number}
            </span>
            <span className="font-display text-xl leading-none font-bold">
              {element.symbol}
            </span>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">
              {element.nameVi}
              <span className="text-ink-soft ml-2 text-sm font-normal">
                ({element.name})
              </span>
            </h3>
            <p className="text-ink-soft text-sm">{element.category}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-ink-soft hover:text-flame text-sm"
        >
          Đóng
        </button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
        <Field label="Khối lượng nguyên tử" value={`${element.atomicMass} u`} />
        <Field label="Số proton / electron" value={String(element.number)} />
        <Field label="Chu kỳ" value={String(element.period)} />
        <Field label="Nhóm" value={String(element.group)} />
        <Field label="Trạng thái" value={element.phase ?? "—"} />
        <Field label="Phân lớp" value={element.block} />
        <Field label="Lớp electron" value={element.shells.join(", ")} />
        <Field
          label="Cấu hình electron"
          value={element.electronConfiguration}
          className="col-span-2 sm:col-span-3"
          mono
        />
      </dl>
    </div>
  );
}

function Field({
  label,
  value,
  className,
  mono,
}: {
  label: string;
  value: string;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div className={className}>
      <dt className="text-ink-soft font-mono text-[11px] uppercase">{label}</dt>
      <dd
        className={cn("text-ink mt-0.5", mono && "font-mono text-xs break-all")}
      >
        {value}
      </dd>
    </div>
  );
}
