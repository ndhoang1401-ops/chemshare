/**
 * Phân tích công thức hóa học thành số lượng nguyên tử từng nguyên tố.
 * Hỗ trợ:
 *  - Công thức đơn giản: H2O, NaCl
 *  - Ngoặc và hệ số ngoặc: Ca(OH)2, Al2(SO4)3
 *  - Ngoặc lồng nhau, nhiều loại ngoặc: K4[Fe(CN)6], [Cu(NH3)4]SO4
 *  - Hydrat (nước kết tinh): CuSO4.5H2O, CuSO4·5H2O
 *  - Hệ số đứng trước toàn bộ công thức: 2H2O (dùng khi ghép vào phương
 *    trình phản ứng ở equation-balancer.ts)
 */

export class FormulaParseError extends Error {}

const CLOSE_OF: Record<string, string> = { "(": ")", "[": "]", "{": "}" };

class FormulaParser {
  private pos = 0;
  constructor(private readonly src: string) {}

  private get current(): string | undefined {
    return this.src[this.pos];
  }

  private isEnd(): boolean {
    return this.pos >= this.src.length;
  }

  private parseNumber(defaultValue: number): number {
    const start = this.pos;
    while (!this.isEnd() && /[0-9]/.test(this.current!)) this.pos++;
    if (start === this.pos) return defaultValue;
    return parseInt(this.src.slice(start, this.pos), 10);
  }

  /** Ký hiệu nguyên tố: 1 chữ hoa + tối đa 2 chữ thường (đúng danh pháp IUPAC hiện tại). */
  private parseElementSymbol(): string {
    const start = this.pos;
    if (!this.current || !/[A-Z]/.test(this.current)) {
      throw new FormulaParseError(
        `Vị trí ${this.pos}: cần ký hiệu nguyên tố (chữ cái viết hoa), gặp "${this.current ?? "hết chuỗi"}"`,
      );
    }
    this.pos++;
    while (!this.isEnd() && /[a-z]/.test(this.current!)) this.pos++;
    return this.src.slice(start, this.pos);
  }

  private mergeInto(
    target: Map<string, number>,
    source: Map<string, number>,
    multiplier: number,
  ) {
    for (const [element, count] of source) {
      target.set(element, (target.get(element) ?? 0) + count * multiplier);
    }
  }

  /** Phân tích một "nhóm": chuỗi liên tiếp các (nguyên tố | nhóm-trong-ngoặc) cho tới khi gặp ranh giới. */
  private parseGroup(stopChars: Set<string>): Map<string, number> {
    const counts = new Map<string, number>();

    while (!this.isEnd() && !stopChars.has(this.current!)) {
      const ch = this.current!;

      if (ch === "(" || ch === "[" || ch === "{") {
        const closeChar = CLOSE_OF[ch];
        this.pos++; // bỏ qua dấu mở
        const inner = this.parseGroup(new Set([closeChar]));
        if (this.current !== closeChar) {
          throw new FormulaParseError(
            `Thiếu dấu đóng "${closeChar}" tương ứng (vị trí ${this.pos})`,
          );
        }
        this.pos++; // bỏ qua dấu đóng
        const multiplier = this.parseNumber(1);
        this.mergeInto(counts, inner, multiplier);
      } else if (/[A-Z]/.test(ch)) {
        const symbol = this.parseElementSymbol();
        const count = this.parseNumber(1);
        counts.set(symbol, (counts.get(symbol) ?? 0) + count);
      } else {
        throw new FormulaParseError(
          `Ký tự không hợp lệ "${ch}" tại vị trí ${this.pos} trong công thức`,
        );
      }
    }

    return counts;
  }

  /** Phân tích toàn bộ công thức, bao gồm cả phần hydrat sau dấu "." hoặc "·". */
  parse(): Map<string, number> {
    if (this.src.trim().length === 0) {
      throw new FormulaParseError("Công thức trống");
    }

    const total = new Map<string, number>();
    const leadingCoefficient = this.parseNumber(1);
    const first = this.parseGroup(new Set([".", "·"]));
    this.mergeInto(total, first, leadingCoefficient);

    while (!this.isEnd() && (this.current === "." || this.current === "·")) {
      this.pos++; // bỏ qua dấu chấm hydrat
      const hydrateCoefficient = this.parseNumber(1);
      const part = this.parseGroup(new Set([".", "·"]));
      this.mergeInto(total, part, hydrateCoefficient);
    }

    if (!this.isEnd()) {
      throw new FormulaParseError(
        `Ký tự thừa "${this.current}" tại vị trí ${this.pos}`,
      );
    }

    for (const [el, count] of total) {
      if (count <= 0) {
        throw new FormulaParseError(
          `Số lượng nguyên tử "${el}" phải lớn hơn 0`,
        );
      }
    }

    return total;
  }
}

/** Loại bỏ khoảng trắng và các dấu · • ⋅ khác nhau về cùng một dấu chấm hydrat chuẩn. */
function normalizeFormula(formula: string): string {
  return formula.trim().replace(/\s+/g, "").replace(/[•⋅]/g, "·");
}

/** Phân tích công thức hóa học, trả về Map<ký hiệu nguyên tố, số lượng nguyên tử>. */
export function parseFormula(formula: string): Map<string, number> {
  return new FormulaParser(normalizeFormula(formula)).parse();
}

/** Tổng số nguyên tử trong công thức (dùng để hiển thị/kiểm tra nhanh). */
export function totalAtomCount(composition: Map<string, number>): number {
  let total = 0;
  for (const count of composition.values()) total += count;
  return total;
}
