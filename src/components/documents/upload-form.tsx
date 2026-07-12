"use client";

import { type FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldError, FormBanner } from "@/components/ui/form-message";
import { GRADE_LABELS } from "@/lib/constants";

interface CategoryOption {
  id: string;
  name: string;
}

interface UploadFormProps {
  categories: CategoryOption[];
}

interface FieldErrors {
  title?: string[];
  description?: string[];
  keywords?: string[];
  categoryId?: string[];
  grade?: string[];
  author?: string[];
}

const MAX_SIZE_MB_HINT = 25;
const ACCEPTED_HINT = ".pdf, .docx, .pptx";

export function UploadForm({ categories }: UploadFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ title: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess({ title: data.document?.title ?? "Tài liệu" });
        formRef.current?.reset();
        setFileName(null);
        router.refresh();
        return;
      }

      if (data.error === "validation_error") {
        setFieldErrors(data.fieldErrors ?? {});
        return;
      }

      if (data.error === "invalid_file_type") {
        setFormError(data.message ?? "File không đúng định dạng cho phép.");
        return;
      }

      if (data.error === "file_too_large") {
        setFormError(
          `File vượt quá dung lượng cho phép (tối đa ${data.maxSizeMb ?? MAX_SIZE_MB_HINT}MB).`,
        );
        return;
      }

      if (data.error === "missing_file" || data.error === "empty_file") {
        setFormError("Vui lòng chọn file để đăng tải.");
        return;
      }

      setFormError("Đã có lỗi xảy ra, vui lòng thử lại.");
    });
  }

  if (success) {
    return (
      <div className="border-line bg-paper-raised rounded-[var(--radius-tile)] border p-8 text-center">
        <h2 className="font-display text-xl font-semibold">
          Đã gửi tài liệu thành công
        </h2>
        <p className="text-ink-soft mt-3 text-sm leading-relaxed">
          <strong className="text-ink">{success.title}</strong> đang chờ kiểm
          duyệt viên phê duyệt. Bạn sẽ nhận thông báo khi tài liệu được duyệt
          hoặc bị từ chối.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/profile" className="text-flame text-sm hover:underline">
            Xem trong hồ sơ của tôi
          </Link>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="text-ink-soft hover:text-flame text-sm"
          >
            Đăng tài liệu khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4"
      encType="multipart/form-data"
    >
      {formError && <FormBanner variant="error">{formError}</FormBanner>}

      <div>
        <Label htmlFor="title">Tiêu đề</Label>
        <Input id="title" name="title" required maxLength={200} />
        <FieldError>{fieldErrors.title?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
        />
        <FieldError>{fieldErrors.description?.[0]}</FieldError>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="categoryId">Chuyên đề Hóa học</Label>
          <Select id="categoryId" name="categoryId" required defaultValue="">
            <option value="" disabled>
              Chọn chuyên đề...
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <FieldError>{fieldErrors.categoryId?.[0]}</FieldError>
        </div>

        <div>
          <Label htmlFor="grade">Lớp học (không bắt buộc)</Label>
          <Select id="grade" name="grade" defaultValue="">
            <option value="">Không áp dụng</option>
            {Object.entries(GRADE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <FieldError>{fieldErrors.grade?.[0]}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="keywords">Từ khóa (cách nhau bởi dấu phẩy)</Label>
        <Input
          id="keywords"
          name="keywords"
          placeholder="hữu cơ, ancol, lớp 11"
        />
        <FieldError>{fieldErrors.keywords?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="author">Tác giả (không bắt buộc)</Label>
        <Input id="author" name="author" maxLength={120} />
        <FieldError>{fieldErrors.author?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="file">File đính kèm</Label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.docx,.pptx"
          onChange={(event) =>
            setFileName(event.target.files?.[0]?.name ?? null)
          }
          className="text-ink file:border-line file:bg-paper-raised file:text-ink hover:file:border-flame hover:file:text-flame block w-full text-sm file:mr-4 file:rounded-[var(--radius-tile)] file:border file:px-3 file:py-2 file:text-sm file:font-medium"
        />
        <p className="text-ink-soft mt-1.5 text-xs">
          Chấp nhận {ACCEPTED_HINT} · tối đa {MAX_SIZE_MB_HINT}MB
          {fileName && (
            <>
              {" "}
              · đã chọn: <span className="text-ink">{fileName}</span>
            </>
          )}
        </p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Đang tải lên..." : "Đăng tải tài liệu"}
      </Button>
    </form>
  );
}
