import { randomBytes } from "node:crypto";

/**
 * Chuyển tiêu đề tiếng Việt có dấu thành slug an toàn cho URL.
 * Ví dụ: "Đề thi Hóa học lớp 10!" -> "de-thi-hoa-hoc-lop-10"
 */
export function slugify(input: string): string {
  return (
    input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu (NFD tách dấu ra dạng combining mark)
      .replace(/đ/gi, (match) => (match === "Đ" ? "D" : "d")) // đ/Đ không tách qua NFD
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "tai-lieu"
  );
}

/** Sinh slug duy nhất: slug-từ-tiêu-đề + hậu tố ngẫu nhiên 6 ký tự */
export function generateUniqueSlug(title: string): string {
  const base = slugify(title);
  const suffix = randomBytes(4).toString("hex").slice(0, 6);
  return `${base}-${suffix}`;
}
