/**
 * Danh sách chuyên mục Hóa học — nguồn dữ liệu gốc (single source of truth).
 * Được dùng lại ở: seed Prisma (Giai đoạn 1), form đăng tải (Giai đoạn 4),
 * bộ lọc tìm kiếm (Giai đoạn 6), trang chủ (Giai đoạn 7), trang quản trị
 * danh mục (Giai đoạn 9).
 *
 * `tile` mô phỏng ký hiệu ô nguyên tố trong bảng tuần hoàn — dùng cho
 * mô-típ thiết kế signature của toàn bộ giao diện.
 */
export type CategoryGroup = "grade" | "field" | "resource";

export interface CategoryDefinition {
  slug: string;
  name: string;
  /** Ký hiệu ngắn hiển thị trên "ô nguyên tố", tối đa 3 ký tự */
  tile: string;
  group: CategoryGroup;
}

export const CATEGORIES: CategoryDefinition[] = [
  { slug: "hoa-8", name: "Hóa 8", tile: "H8", group: "grade" },
  { slug: "hoa-9", name: "Hóa 9", tile: "H9", group: "grade" },
  { slug: "hoa-10", name: "Hóa 10", tile: "H10", group: "grade" },
  { slug: "hoa-11", name: "Hóa 11", tile: "H11", group: "grade" },
  { slug: "hoa-12", name: "Hóa 12", tile: "H12", group: "grade" },
  { slug: "hoa-dai-cuong", name: "Hóa đại cương", tile: "Đc", group: "field" },
  { slug: "hoa-huu-co", name: "Hóa hữu cơ", tile: "Hc", group: "field" },
  { slug: "hoa-vo-co", name: "Hóa vô cơ", tile: "Vc", group: "field" },
  { slug: "hoa-phan-tich", name: "Hóa phân tích", tile: "Pt", group: "field" },
  { slug: "hoa-ly", name: "Hóa lý", tile: "Hl", group: "field" },
  { slug: "hoa-sinh", name: "Hóa sinh", tile: "Hs", group: "field" },
  { slug: "de-thi", name: "Đề thi", tile: "Đt", group: "resource" },
  {
    slug: "chuyen-de-olympic",
    name: "Chuyên đề Olympic",
    tile: "Ol",
    group: "resource",
  },
  {
    slug: "tai-lieu-giao-vien",
    name: "Tài liệu giáo viên",
    tile: "Gv",
    group: "resource",
  },
];

export const DOCUMENT_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type DocumentStatus =
  (typeof DOCUMENT_STATUSES)[keyof typeof DOCUMENT_STATUSES];

export const USER_ROLES = {
  USER: "user",
  MODERATOR: "moderator",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

export const SITE_NAME = "Nguyên Tố";
export const SITE_TAGLINE = "Kho tài liệu Hóa học cho người học";
