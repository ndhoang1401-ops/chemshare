"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormBanner } from "@/components/ui/form-message";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email hoặc mật khẩu không đúng.",
  email_not_verified:
    "Email chưa được xác thực. Vui lòng kiểm tra hộp thư để xác thực trước khi đăng nhập.",
  account_suspended:
    "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          ERROR_MESSAGES[result.code ?? ""] ??
            "Đã có lỗi xảy ra, vui lòng thử lại.",
        );
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-semibold">Đăng nhập</h1>
        <p className="text-ink-soft mt-1 text-sm">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-flame hover:underline">
            Đăng ký
          </Link>
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

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="password" className="mb-0">
            Mật khẩu
          </Label>
          <Link
            href="/forgot-password"
            className="text-ink-soft hover:text-flame text-xs"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
