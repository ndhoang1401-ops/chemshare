import { z } from "zod";

export const changeRoleSchema = z.object({
  role: z.enum(["USER", "MODERATOR", "ADMIN"], {
    error: "Vai trò không hợp lệ",
  }),
});

export const setActiveSchema = z.object({
  isActive: z.boolean(),
});

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categorySchema = z.object({
  name: z
    .string({ error: "Vui lòng nhập tên chuyên đề" })
    .trim()
    .min(2, "Tên chuyên đề phải có ít nhất 2 ký tự")
    .max(50, "Tên chuyên đề tối đa 50 ký tự"),
  slug: z
    .string({ error: "Vui lòng nhập slug" })
    .trim()
    .toLowerCase()
    .regex(slugPattern, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  tile: z
    .string({ error: "Vui lòng nhập ký hiệu" })
    .trim()
    .min(1, "Vui lòng nhập ký hiệu")
    .max(3, "Ký hiệu tối đa 3 ký tự"),
  group: z.enum(["GRADE", "FIELD", "RESOURCE"], {
    error: "Vui lòng chọn nhóm",
  }),
});

export type CategoryInput = z.infer<typeof categorySchema>;
