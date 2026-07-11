"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormBanner, FieldError } from "@/components/ui/form-message";

interface RegisterFormState {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  displayName?: string[];
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
}

const initialForm: RegisterFormState = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm() {
  const [form, setForm] = useState<RegisterFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update(key: keyof RegisterFormState) {
    return (event: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: event.target.value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSubmittedEmail(form.email);
        return;
      }

      if (data.error === "validation_error") {
        setFieldErrors(data.fieldErrors ?? {});
        return;
      }

      setFormError(data.message ?? "Đã có lỗi xảy ra, vui lòng thử lại.");
    });
  }

  if (submittedEmail) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">
          Kiểm tra email của bạn
        </h1>
        <p className="text-ink-soft mt-3 text-sm leading-relaxed">
          Chúng tôi đã gửi một liên kết xác thực tới{" "}
          <strong className="text-ink">{submittedEmail}</strong>. Vui lòng mở
          email và bấm vào liên kết để hoàn tất đăng ký.
        </p>
        <Link
          href="/login"
          className="text-flame mt-6 inline-block text-sm hover:underline"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-semibold">Đăng ký</h1>
        <p className="text-ink-soft mt-1 text-sm">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-flame hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>

      {formError && <FormBanner variant="error">{formError}</FormBanner>}

      <div>
        <Label htmlFor="displayName">Tên hiển thị</Label>
        <Input
          id="displayName"
          required
          value={form.displayName}
          onChange={update("displayName")}
        />
        <FieldError>{fieldErrors.displayName?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update("email")}
        />
        <FieldError>{fieldErrors.email?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={update("password")}
        />
        <FieldError>{fieldErrors.password?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirmPassword}
          onChange={update("confirmPassword")}
        />
        <FieldError>{fieldErrors.confirmPassword?.[0]}</FieldError>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </Button>
    </form>
  );
}
