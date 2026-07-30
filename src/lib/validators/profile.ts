import { z } from "zod";
import { password, displayName } from "@/lib/validators/auth";

export const updateProfileSchema = z.object({
  displayName,
  bio: z
    .string()
    .trim()
    .max(280, "Giới thiệu tối đa 280 ký tự")
    .optional()
    .or(z.literal("")),
  // Giai đoạn 12: chỉ chấp nhận scheme http/https — chặn javascript:,
  // data:, file:, vbscript:... (đã test thật bằng zod v4.4.3, xem
  // NEXTJS_NOTES.md).
  avatar: z
    .url({ protocol: /^https?$/, error: "Đường dẫn ảnh không hợp lệ" })
    .max(500)
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: "Vui lòng nhập mật khẩu hiện tại" })
      .min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: password,
    confirmNewPassword: z.string({ error: "Vui lòng nhập lại mật khẩu mới" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
