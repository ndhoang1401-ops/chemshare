import { hash, verify } from "@node-rs/argon2";

/**
 * Tham số Argon2id theo khuyến nghị OWASP cho ứng dụng web (2024):
 * m=19456 (19 MiB), t=2, p=1. Cân bằng giữa bảo mật và tải server khi có
 * nhiều lượt đăng nhập đồng thời.
 */
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(plainPassword: string): Promise<string> {
  return hash(plainPassword, ARGON2_OPTIONS);
}

export async function verifyPassword(
  hashedPassword: string,
  plainPassword: string,
): Promise<boolean> {
  try {
    return await verify(hashedPassword, plainPassword, ARGON2_OPTIONS);
  } catch {
    // Hash sai định dạng hoặc lỗi native binding — coi như không khớp
    // thay vì để lỗi rò rỉ thông tin lên trên.
    return false;
  }
}
