"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormBanner, FieldError } from "@/components/ui/form-message";

const TOKEN_ERROR_MESSAGES: Record<string, string> = {
  not_found: "Liên kết không hợp lệ hoặc đã được sử dụng.",
  expired: "Liên kết đã hết hạn. Vui lòng yêu cầu liên kết mới.",
};

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string[];
    confirmPassword?: string[];
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">
          Thiếu mã đặt lại mật khẩu
        </h1>
        <p className="text-ink-soft mt-3 text-sm leading-relaxed">
          Vui lòng mở liên kết trực tiếp từ email đặt lại mật khẩu.
        </p>
        <Link
          href="/forgot-password"
          className="text-flame mt-6 inline-block text-sm hover:underline"
        >
          Yêu cầu liên kết mới
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">
          Đặt lại mật khẩu thành công
        </h1>
        <p className="text-ink-soft mt-3 text-sm leading-relaxed">
          Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
        </p>
        <Link
          href="/login"
          className="text-flame mt-6 inline-block text-sm hover:underline"
        >
          Đến trang đăng nhập
        </Link>
      </div>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
        return;
      }

      if (data.error === "validation_error") {
        setFieldErrors(data.fieldErrors ?? {});
        return;
      }

      setFormError(
        TOKEN_ERROR_MESSAGES[data.error] ??
          "Đã có lỗi xảy ra, vui lòng thử lại.",
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-semibold">
          Đặt mật khẩu mới
        </h1>
      </div>

      {formError && <FormBanner variant="error">{formError}</FormBanner>}

      <div>
        <Label htmlFor="password">Mật khẩu mới</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <FieldError>{fieldErrors.password?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Nhập lại mật khẩu mới</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <FieldError>{fieldErrors.confirmPassword?.[0]}</FieldError>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Đang lưu..." : "Đặt lại mật khẩu"}
      </Button>
    </form>
  );
}
