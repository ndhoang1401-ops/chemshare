"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FormBanner } from "@/components/ui/form-message";

const TOKEN_ERROR_MESSAGES: Record<string, string> = {
  not_found: "Liên kết không hợp lệ hoặc email đã được xác thực trước đó.",
  expired: "Liên kết đã hết hạn. Vui lòng đăng ký lại hoặc liên hệ hỗ trợ.",
};

const REDIRECT_DELAY_MS = 2500;

type Status = "loading" | "success" | "error";

export function VerifyEmailStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState<string>(
    token ? "" : "Thiếu mã xác thực trong liên kết.",
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(
            TOKEN_ERROR_MESSAGES[data.error] ??
              "Đã có lỗi xảy ra, vui lòng thử lại.",
          );
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Không thể kết nối tới máy chủ, vui lòng thử lại.");
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Xác thực thành công -> tự động chuyển sang trang đăng nhập sau vài
  // giây, không bắt người dùng phải bấm link thủ công.
  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => {
      router.push("/login");
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">
          Đang xác thực email...
        </h1>
        <p className="text-ink-soft mt-3 text-sm">
          Vui lòng đợi trong giây lát.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">
          Xác thực thành công
        </h1>
        <p className="text-ink-soft mt-3 text-sm leading-relaxed">
          Email của bạn đã được xác thực. Đang chuyển tới trang đăng nhập...
        </p>
        <Link
          href="/login"
          className="text-flame mt-6 inline-block text-sm hover:underline"
        >
          Đến ngay bây giờ
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="font-display mb-4 text-2xl font-semibold">
        Xác thực email
      </h1>
      <FormBanner variant="error">{message}</FormBanner>
      <Link
        href="/login"
        className="text-flame mt-6 inline-block text-sm hover:underline"
      >
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
