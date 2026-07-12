import { z } from "zod";

const GRADE_VALUES = [
  "GRADE_8",
  "GRADE_9",
  "GRADE_10",
  "GRADE_11",
  "GRADE_12",
] as const;

export const uploadDocumentSchema = z.object({
  title: z
    .string({ error: "Vui lòng nhập tiêu đề" })
    .trim()
    .min(3, "Tiêu đề phải có ít nhất 3 ký tự")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  description: z
    .string()
    .trim()
    .max(2000, "Mô tả tối đa 2000 ký tự")
    .optional()
    .or(z.literal("")),
  // Từ khóa nhập dạng "a, b, c" (form field kiểu chuỗi vì đi cùng multipart/form-data).
  keywords: z
    .string()
    .trim()
    .max(300, "Từ khóa tối đa 300 ký tự")
    .optional()
    .or(z.literal("")),
  categoryId: z
    .string({ error: "Vui lòng chọn chuyên đề" })
    .min(1, "Vui lòng chọn chuyên đề"),
  grade: z.enum(GRADE_VALUES).optional().or(z.literal("")),
  author: z
    .string()
    .trim()
    .max(120, "Tên tác giả tối đa 120 ký tự")
    .optional()
    .or(z.literal("")),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

/** Tách chuỗi "a, b, c" thành mảng từ khóa đã trim, bỏ phần tử rỗng, tối đa 10 từ khóa. */
export function parseKeywords(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 10);
}
