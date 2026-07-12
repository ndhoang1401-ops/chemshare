import { z } from "zod";

const email = z
  .string({ error: "Vui lòng nhập email" })
  .trim()
  .toLowerCase()
  .pipe(z.email("Email không hợp lệ"));

export const password = z
  .string({ error: "Vui lòng nhập mật khẩu" })
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .max(72, "Mật khẩu tối đa 72 ký tự")
  .regex(/[a-zA-Z]/, "Mật khẩu phải chứa ít nhất một chữ cái")
  .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một chữ số");

export const displayName = z
  .string({ error: "Vui lòng nhập tên hiển thị" })
  .trim()
  .min(2, "Tên hiển thị phải có ít nhất 2 ký tự")
  .max(50, "Tên hiển thị tối đa 50 ký tự");

export const registerSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string({ error: "Vui lòng nhập lại mật khẩu" }),
    displayName,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z
    .string({ error: "Vui lòng nhập mật khẩu" })
    .min(1, "Vui lòng nhập mật khẩu"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Thiếu mã đặt lại mật khẩu"),
    password,
    confirmPassword: z.string({ error: "Vui lòng nhập lại mật khẩu" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
