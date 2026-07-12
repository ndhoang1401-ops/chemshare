"use client";

import { type FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, FormBanner } from "@/components/ui/form-message";

interface FieldErrors {
  currentPassword?: string[];
  newPassword?: string[];
  confirmNewPassword?: string[];
}

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export function ChangePasswordForm() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function update(key: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: event.target.value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSuccess(false);

    startTransition(async () => {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
        setForm(initialForm);
        return;
      }

      if (data.error === "validation_error") {
        setFieldErrors(data.fieldErrors ?? {});
        return;
      }

      if (data.error === "wrong_current_password") {
        setFormError("Mật khẩu hiện tại không đúng.");
        return;
      }

      setFormError("Đã có lỗi xảy ra, vui lòng thử lại.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <FormBanner variant="error">{formError}</FormBanner>}
      {success && (
        <FormBanner variant="success">Đã đổi mật khẩu thành công.</FormBanner>
      )}

      <div>
        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          value={form.currentPassword}
          onChange={update("currentPassword")}
        />
        <FieldError>{fieldErrors.currentPassword?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="newPassword">Mật khẩu mới</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          required
          value={form.newPassword}
          onChange={update("newPassword")}
        />
        <FieldError>{fieldErrors.newPassword?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="confirmNewPassword">Nhập lại mật khẩu mới</Label>
        <Input
          id="confirmNewPassword"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirmNewPassword}
          onChange={update("confirmNewPassword")}
        />
        <FieldError>{fieldErrors.confirmNewPassword?.[0]}</FieldError>
      </div>

      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? "Đang đổi..." : "Đổi mật khẩu"}
      </Button>
    </form>
  );
}
