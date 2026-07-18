/**
 * Chuyển đổi giữa các đơn vị nồng độ dung dịch. Công thức gốc:
 *   C(mol/L) = (10 × D × C%) / M
 * trong đó D = khối lượng riêng dung dịch (g/mL), M = khối lượng mol
 * chất tan (g/mol), C% = nồng độ phần trăm khối lượng.
 *
 * Công cụ nhận vào khối lượng mol (từ công thức chất tan) cùng ĐÚNG 2
 * trong 3 đại lượng {nồng độ mol, nồng độ %, khối lượng riêng} — tự tính
 * đại lượng còn thiếu, đồng thời luôn tính ra nồng độ khối lượng (g/L)
 * vì đại lượng này chỉ cần nồng độ mol + khối lượng mol.
 */

export class ConcentrationError extends Error {}

export interface ConcentrationInput {
  molarMass: number;
  molarity?: number;
  massPercent?: number;
  density?: number;
}

export interface ConcentrationResult {
  molarity: number | null;
  massPercent: number | null;
  density: number | null;
  /** Nồng độ khối lượng, g/L — luôn tính được nếu biết nồng độ mol */
  massConcentration: number | null;
}

function countProvided(...values: (number | undefined)[]): number {
  return values.filter((v) => v !== undefined && v !== null && !Number.isNaN(v))
    .length;
}

export function convertConcentration(
  input: ConcentrationInput,
): ConcentrationResult {
  const { molarMass, molarity, massPercent, density } = input;

  if (!molarMass || molarMass <= 0) {
    throw new ConcentrationError(
      "Cần khối lượng mol hợp lệ của chất tan (nhập công thức hóa học)",
    );
  }

  const provided = countProvided(molarity, massPercent, density);
  if (provided < 2) {
    throw new ConcentrationError(
      "Cần nhập ít nhất 2 trong 3 giá trị: nồng độ mol, nồng độ phần trăm, khối lượng riêng",
    );
  }

  for (const [label, value] of [
    ["Nồng độ mol", molarity],
    ["Nồng độ phần trăm", massPercent],
    ["Khối lượng riêng", density],
  ] as const) {
    if (value !== undefined && value <= 0) {
      throw new ConcentrationError(`${label} phải lớn hơn 0`);
    }
  }
  if (massPercent !== undefined && massPercent > 100) {
    throw new ConcentrationError("Nồng độ phần trăm không thể vượt quá 100%");
  }

  let resultMolarity = molarity ?? null;
  let resultMassPercent = massPercent ?? null;
  let resultDensity = density ?? null;

  if (resultMolarity === null) {
    // Cần massPercent + density
    resultMolarity = (10 * density! * massPercent!) / molarMass;
  } else if (resultMassPercent === null) {
    // Cần molarity + density
    resultMassPercent = (resultMolarity * molarMass) / (10 * density!);
  } else if (resultDensity === null) {
    // Cần molarity + massPercent
    resultDensity = (resultMolarity * molarMass) / (10 * resultMassPercent);
  }

  const massConcentration =
    resultMolarity !== null ? resultMolarity * molarMass : null;

  return {
    molarity: resultMolarity !== null ? roundTo(resultMolarity, 5) : null,
    massPercent:
      resultMassPercent !== null ? roundTo(resultMassPercent, 3) : null,
    density: resultDensity !== null ? roundTo(resultDensity, 4) : null,
    massConcentration:
      massConcentration !== null ? roundTo(massConcentration, 3) : null,
  };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
