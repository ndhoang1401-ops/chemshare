import {
  parseFormula,
  FormulaParseError,
} from "@/lib/chemistry/formula-parser";
import { ELEMENT_BY_SYMBOL } from "@/lib/chemistry/elements";

export class MolarMassError extends Error {}

export interface MolarMassBreakdownRow {
  symbol: string;
  nameVi: string;
  count: number;
  atomicMass: number;
  /** count * atomicMass */
  subtotal: number;
  /** % khối lượng trong tổng phân tử */
  percentage: number;
}

export interface MolarMassResult {
  formula: string;
  totalMass: number;
  breakdown: MolarMassBreakdownRow[];
}

/**
 * Tính khối lượng mol (g/mol) từ công thức hóa học. Ném MolarMassError với
 * thông báo tiếng Việt nếu công thức sai cú pháp hoặc chứa ký hiệu nguyên
 * tố không tồn tại (khác với FormulaParseError ở tầng dưới chỉ lo cú pháp).
 */
export function calculateMolarMass(formula: string): MolarMassResult {
  let composition: Map<string, number>;
  try {
    composition = parseFormula(formula);
  } catch (error) {
    if (error instanceof FormulaParseError) {
      throw new MolarMassError(error.message);
    }
    throw error;
  }

  const unknownSymbols: string[] = [];
  for (const symbol of composition.keys()) {
    if (!ELEMENT_BY_SYMBOL.has(symbol)) unknownSymbols.push(symbol);
  }
  if (unknownSymbols.length > 0) {
    throw new MolarMassError(
      `Không nhận diện được ký hiệu nguyên tố: ${unknownSymbols.join(", ")}. Kiểm tra lại chữ hoa/thường (vd. "Co" là Coban, "CO" không phải một nguyên tố).`,
    );
  }

  let totalMass = 0;
  const rows: Omit<MolarMassBreakdownRow, "percentage">[] = [];
  for (const [symbol, count] of composition) {
    const element = ELEMENT_BY_SYMBOL.get(symbol)!;
    const subtotal = element.atomicMass * count;
    totalMass += subtotal;
    rows.push({
      symbol,
      nameVi: element.nameVi,
      count,
      atomicMass: element.atomicMass,
      subtotal,
    });
  }

  const breakdown: MolarMassBreakdownRow[] = rows
    .sort((a, b) => b.subtotal - a.subtotal)
    .map((row) => ({
      ...row,
      percentage: (row.subtotal / totalMass) * 100,
    }));

  return {
    formula,
    totalMass: roundTo(totalMass, 4),
    breakdown: breakdown.map((row) => ({
      ...row,
      subtotal: roundTo(row.subtotal, 4),
      percentage: roundTo(row.percentage, 2),
    })),
  };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
