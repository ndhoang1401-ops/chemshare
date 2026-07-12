/**
 * Danh sách chuyên mục Hóa học — nguồn dữ liệu gốc (single source of truth).
 * Được dùng lại ở: seed Prisma (Giai đoạn 1), form đăng tải (Giai đoạn 4),
 * bộ lọc tìm kiếm (Giai đoạn 6), trang chủ (Giai đoạn 7), trang quản trị
 * danh mục (Giai đoạn 9).
 *
 * `tile` mô phỏng ký hiệu ô nguyên tố trong bảng tuần hoàn — dùng cho
 * mô-típ thiết kế signature của toàn bộ giao diện.
 */
export type CategoryGroup = "GRADE" | "FIELD" | "RESOURCE";

export interface CategoryDefinition {
  slug: string;
  name: string;
  /** Ký hiệu ngắn hiển thị trên "ô nguyên tố", tối đa 3 ký tự */
  tile: string;
  group: CategoryGroup;
}

export const CATEGORIES: CategoryDefinition[] = [
  { slug: "hoa-8", name: "Hóa 8", tile: "H8", group: "GRADE" },
  { slug: "hoa-9", name: "Hóa 9", tile: "H9", group: "GRADE" },
  { slug: "hoa-10", name: "Hóa 10", tile: "H10", group: "GRADE" },
  { slug: "hoa-11", name: "Hóa 11", tile: "H11", group: "GRADE" },
  { slug: "hoa-12", name: "Hóa 12", tile: "H12", group: "GRADE" },
  { slug: "hoa-dai-cuong", name: "Hóa đại cương", tile: "Đc", group: "FIELD" },
  { slug: "hoa-huu-co", name: "Hóa hữu cơ", tile: "Hc", group: "FIELD" },
  { slug: "hoa-vo-co", name: "Hóa vô cơ", tile: "Vc", group: "FIELD" },
  { slug: "hoa-phan-tich", name: "Hóa phân tích", tile: "Pt", group: "FIELD" },
  { slug: "hoa-ly", name: "Hóa lý", tile: "Hl", group: "FIELD" },
  { slug: "hoa-sinh", name: "Hóa sinh", tile: "Hs", group: "FIELD" },
  { slug: "de-thi", name: "Đề thi", tile: "Đt", group: "RESOURCE" },
  {
    slug: "chuyen-de-olympic",
    name: "Chuyên đề Olympic",
    tile: "Ol",
    group: "RESOURCE",
  },
  {
    slug: "tai-lieu-giao-vien",
    name: "Tài liệu giáo viên",
    tile: "Gv",
    group: "RESOURCE",
  },
];

export const DOCUMENT_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type DocumentStatus =
  (typeof DOCUMENT_STATUSES)[keyof typeof DOCUMENT_STATUSES];

export const USER_ROLES = {
  USER: "USER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  USER: "Thành viên",
  MODERATOR: "Kiểm duyệt viên",
  ADMIN: "Quản trị viên",
};

export const GRADE_LABELS: Record<string, string> = {
  GRADE_8: "Lớp 8",
  GRADE_9: "Lớp 9",
  GRADE_10: "Lớp 10",
  GRADE_11: "Lớp 11",
  GRADE_12: "Lớp 12",
};

export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

export const SITE_NAME = "Nguyên Tố";
export const SITE_TAGLINE = "Kho tài liệu Hóa học cho người học";
