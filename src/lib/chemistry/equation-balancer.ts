import {
  parseFormula,
  FormulaParseError,
} from "@/lib/chemistry/formula-parser";

export class EquationBalanceError extends Error {}

// ─────────────────────────────────────────────────────────────
// Số học phân số chính xác bằng BigInt — bắt buộc phải dùng phân số thay
// vì số thực (floating point), vì sai số làm tròn dù rất nhỏ cũng khiến
// hệ số cân bằng ra sai (đây là phép toán cần chính xác tuyệt đối).
// ─────────────────────────────────────────────────────────────

function gcdBigInt(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcmBigInt(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  return (a / gcdBigInt(a, b)) * b;
}

class Frac {
  readonly num: bigint;
  readonly den: bigint;

  constructor(num: bigint, den: bigint = 1n) {
    if (den === 0n)
      throw new EquationBalanceError(
        "Lỗi nội bộ: chia cho 0 khi cân bằng phương trình",
      );
    if (den < 0n) {
      num = -num;
      den = -den;
    }
    const g = gcdBigInt(num, den) || 1n;
    this.num = num / g;
    this.den = den / g;
  }

  static readonly ZERO = new Frac(0n);
  static readonly ONE = new Frac(1n);

  add(o: Frac): Frac {
    return new Frac(this.num * o.den + o.num * this.den, this.den * o.den);
  }
  sub(o: Frac): Frac {
    return new Frac(this.num * o.den - o.num * this.den, this.den * o.den);
  }
  mul(o: Frac): Frac {
    return new Frac(this.num * o.num, this.den * o.den);
  }
  div(o: Frac): Frac {
    if (o.num === 0n)
      throw new EquationBalanceError(
        "Lỗi nội bộ: chia cho 0 khi cân bằng phương trình",
      );
    return new Frac(this.num * o.den, this.den * o.num);
  }
  neg(): Frac {
    return new Frac(-this.num, this.den);
  }
  isZero(): boolean {
    return this.num === 0n;
  }
}

/** Đưa ma trận về dạng bậc thang rút gọn (RREF), trả về ma trận đã biến đổi + danh sách cột trụ (pivot). */
function toReducedRowEchelonForm(input: Frac[][]): {
  matrix: Frac[][];
  pivotCols: number[];
} {
  const matrix = input.map((row) => [...row]);
  const numRows = matrix.length;
  const numCols = matrix[0]?.length ?? 0;
  const pivotCols: number[] = [];
  let pivotRow = 0;

  for (let col = 0; col < numCols && pivotRow < numRows; col++) {
    let selected = -1;
    for (let r = pivotRow; r < numRows; r++) {
      if (!matrix[r][col].isZero()) {
        selected = r;
        break;
      }
    }
    if (selected === -1) continue;

    [matrix[pivotRow], matrix[selected]] = [matrix[selected], matrix[pivotRow]];

    const pivotValue = matrix[pivotRow][col];
    for (let c = 0; c < numCols; c++) {
      matrix[pivotRow][c] = matrix[pivotRow][c].div(pivotValue);
    }

    for (let r = 0; r < numRows; r++) {
      if (r === pivotRow) continue;
      const factor = matrix[r][col];
      if (factor.isZero()) continue;
      for (let c = 0; c < numCols; c++) {
        matrix[r][c] = matrix[r][c].sub(factor.mul(matrix[pivotRow][c]));
      }
    }

    pivotCols.push(col);
    pivotRow++;
  }

  return { matrix, pivotCols };
}

/** Tìm 1 vector trong không gian nghiệm (null space) của ma trận đã ở dạng RREF — dùng biến tự do đầu tiên = 1. */
function findNullSpaceVector(
  rrefMatrix: Frac[][],
  pivotCols: number[],
  numCols: number,
): Frac[] | null {
  const pivotSet = new Set(pivotCols);
  const freeCols: number[] = [];
  for (let c = 0; c < numCols; c++) {
    if (!pivotSet.has(c)) freeCols.push(c);
  }
  if (freeCols.length === 0) return null;

  const freeCol = freeCols[0];
  const solution = new Array<Frac>(numCols).fill(Frac.ZERO);
  solution[freeCol] = Frac.ONE;

  for (let i = 0; i < pivotCols.length; i++) {
    const pc = pivotCols[i];
    solution[pc] = rrefMatrix[i][freeCol].neg();
  }

  return solution;
}

/** Quy đổi vector phân số thành số nguyên nhỏ nhất có thể (nhân với BCNN mẫu số, chia cho ƯCLN). */
function toSmallestIntegers(fracs: Frac[]): bigint[] {
  let lcm = 1n;
  for (const f of fracs) lcm = lcmBigInt(lcm, f.den);

  let ints = fracs.map((f) => f.num * (lcm / f.den));

  const allNonPositive = ints.every((x) => x <= 0n);
  if (allNonPositive) ints = ints.map((x) => -x);

  let g = 0n;
  for (const x of ints) g = gcdBigInt(g, x);
  if (g > 1n) ints = ints.map((x) => x / g);

  return ints;
}

// ─────────────────────────────────────────────────────────────
// Phân tích chuỗi phương trình + cân bằng
// ─────────────────────────────────────────────────────────────

export interface BalancedTerm {
  formula: string;
  coefficient: number;
}

export interface BalanceResult {
  reactants: BalancedTerm[];
  products: BalancedTerm[];
  balancedEquation: string;
}

const ARROW_PATTERN = /->|-->|=|→|⟶/;

/** Bỏ hệ số đứng đầu (nếu người dùng lỡ gõ) — hệ số cân bằng do thuật toán tự tính lại từ đầu. */
function stripLeadingCoefficient(term: string): string {
  return term.replace(/^\d+\s*/, "");
}

function splitTerms(side: string): string[] {
  return side
    .split("+")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function balanceEquation(input: string): BalanceResult {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new EquationBalanceError("Vui lòng nhập phương trình hóa học");
  }
  if (!ARROW_PATTERN.test(trimmed)) {
    throw new EquationBalanceError(
      'Thiếu dấu mũi tên/dấu "=" ngăn cách hai vế phản ứng (vd. "Fe + O2 -> Fe2O3")',
    );
  }

  const [reactantSide, productSide, ...rest] = trimmed.split(ARROW_PATTERN);
  if (rest.length > 0 || !reactantSide?.trim() || !productSide?.trim()) {
    throw new EquationBalanceError(
      "Phương trình phải có đúng 1 vế trái và 1 vế phải",
    );
  }

  const reactantFormulas = splitTerms(reactantSide).map(
    stripLeadingCoefficient,
  );
  const productFormulas = splitTerms(productSide).map(stripLeadingCoefficient);

  if (reactantFormulas.length === 0 || productFormulas.length === 0) {
    throw new EquationBalanceError("Mỗi vế phải có ít nhất 1 chất");
  }

  const allFormulas = [...reactantFormulas, ...productFormulas];
  const compositions: Map<string, number>[] = [];
  for (const formula of allFormulas) {
    try {
      compositions.push(parseFormula(formula));
    } catch (error) {
      if (error instanceof FormulaParseError) {
        throw new EquationBalanceError(
          `Công thức "${formula}" không hợp lệ: ${error.message}`,
        );
      }
      throw error;
    }
  }

  const elements = Array.from(
    new Set(compositions.flatMap((c) => [...c.keys()])),
  ).sort();
  if (elements.length === 0) {
    throw new EquationBalanceError(
      "Không đọc được nguyên tố nào trong phương trình",
    );
  }

  const numReactants = reactantFormulas.length;
  const numTerms = allFormulas.length;

  // Ma trận: hàng = nguyên tố, cột = từng chất. Chất ở vế trái mang dấu
  // dương, vế phải mang dấu âm — nghiệm của hệ Ax=0 chính là bộ hệ số cân
  // bằng (số nguyên tử vào = số nguyên tử ra cho mọi nguyên tố).
  const matrix: Frac[][] = elements.map((element) =>
    compositions.map((comp, colIndex) => {
      const count = comp.get(element) ?? 0;
      const signed = colIndex < numReactants ? count : -count;
      return new Frac(BigInt(signed));
    }),
  );

  const { matrix: rrefMatrix, pivotCols } = toReducedRowEchelonForm(matrix);
  const nullVector = findNullSpaceVector(rrefMatrix, pivotCols, numTerms);

  if (!nullVector) {
    throw new EquationBalanceError(
      "Không cân bằng được — phương trình có thể sai (thiếu/thừa chất, hoặc phản ứng không tồn tại)",
    );
  }

  const integers = toSmallestIntegers(nullVector);

  if (integers.some((x) => x === 0n)) {
    throw new EquationBalanceError(
      "Không cân bằng được với đúng các chất đã cho — kiểm tra lại phương trình",
    );
  }
  if (integers.some((x) => x < 0n)) {
    throw new EquationBalanceError(
      "Phương trình không hợp lệ về mặt hóa học (hệ số ra âm) — kiểm tra lại chất phản ứng/sản phẩm",
    );
  }

  const coefficients = integers.map((x) => Number(x));

  const reactants: BalancedTerm[] = reactantFormulas.map((formula, i) => ({
    formula,
    coefficient: coefficients[i],
  }));
  const products: BalancedTerm[] = productFormulas.map((formula, i) => ({
    formula,
    coefficient: coefficients[numReactants + i],
  }));

  const formatSide = (terms: BalancedTerm[]) =>
    terms
      .map((t) =>
        t.coefficient === 1 ? t.formula : `${t.coefficient}${t.formula}`,
      )
      .join(" + ");

  const balancedEquation = `${formatSide(reactants)} → ${formatSide(products)}`;

  return { reactants, products, balancedEquation };
}
