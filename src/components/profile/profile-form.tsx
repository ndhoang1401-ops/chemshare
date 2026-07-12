"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError, FormBanner } from "@/components/ui/form-message";

interface ProfileFormProps {
  initialDisplayName: string;
  initialBio: string;
  initialAvatar: string;
}

interface FieldErrors {
  displayName?: string[];
  bio?: string[];
  avatar?: string[];
}

export function ProfileForm({
  initialDisplayName,
  initialBio,
  initialAvatar,
}: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSuccess(false);

    startTransition(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, avatar }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
        router.refresh();
        return;
      }

      if (data.error === "validation_error") {
        setFieldErrors(data.fieldErrors ?? {});
        return;
      }

      setFormError("Đã có lỗi xảy ra, vui lòng thử lại.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar src={avatar || null} name={displayName || "?"} size="lg" />
        <div className="flex-1">
          <Label htmlFor="avatar">Đường dẫn ảnh đại diện</Label>
          <Input
            id="avatar"
            type="url"
            placeholder="https://..."
            value={avatar}
            onChange={(event) => setAvatar(event.target.value)}
          />
          <FieldError>{fieldErrors.avatar?.[0]}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="displayName">Tên hiển thị</Label>
        <Input
          id="displayName"
          required
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
        <FieldError>{fieldErrors.displayName?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="bio">Giới thiệu ngắn</Label>
        <Textarea
          id="bio"
          rows={3}
          maxLength={280}
          placeholder="Vài dòng giới thiệu về bạn..."
          value={bio}
          onChange={(event) => setBio(event.target.value)}
        />
        <FieldError>{fieldErrors.bio?.[0]}</FieldError>
      </div>

      {formError && <FormBanner variant="error">{formError}</FormBanner>}
      {success && (
        <FormBanner variant="success">Đã lưu thay đổi hồ sơ.</FormBanner>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
