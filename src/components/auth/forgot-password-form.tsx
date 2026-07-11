"use client";

import { type FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormBanner } from "@/components/ui/form-message";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.fieldErrors?.email?.[0] ?? "Đã có lỗi xảy ra, vui lòng thử lại.",
        );
        return;
      }

      // Backend luôn trả 200 dù email có tồn tại hay không (tránh lộ
      // thông tin tài khoản), nên UI cũng luôn hiển thị cùng một thông
      // báo thành công.
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">Đã gửi liên kết</h1>
        <p className="text-ink-soft mt-3 text-sm leading-relaxed">
          Nếu <strong className="text-ink">{email}</strong> tồn tại trong hệ
          thống, chúng tôi đã gửi một liên kết đặt lại mật khẩu tới email đó.
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
        <h1 className="font-display text-2xl font-semibold">Quên mật khẩu</h1>
        <p className="text-ink-soft mt-1 text-sm leading-relaxed">
          Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
        </p>
      </div>

      {error && <FormBanner variant="error">{error}</FormBanner>}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Đang gửi..." : "Gửi liên kết đặt lại"}
      </Button>

      <p className="text-ink-soft text-center text-sm">
        <Link href="/login" className="text-flame hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
