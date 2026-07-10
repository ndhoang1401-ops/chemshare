import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Gộp và khử trùng lặp class Tailwind một cách an toàn.
 * Dùng cho mọi component trong dự án thay vì nối chuỗi thủ công.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
