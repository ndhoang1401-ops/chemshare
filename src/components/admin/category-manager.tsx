"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormBanner } from "@/components/ui/form-message";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  tile: string;
  group: "GRADE" | "FIELD" | "RESOURCE";
  documentCount: number;
}

const GROUP_LABELS: Record<CategoryRow["group"], string> = {
  GRADE: "Theo lớp",
  FIELD: "Theo lĩnh vực",
  RESOURCE: "Theo loại tài liệu",
};

const emptyForm: {
  name: string;
  slug: string;
  tile: string;
  group: CategoryRow["group"];
} = { name: "", slug: "", tile: "", group: "FIELD" };

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    setCreateError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const firstError = Object.values(data.fieldErrors ?? {})[0] as
          string[] | undefined;
        setCreateError(firstError?.[0] ?? "Không tạo được danh mục.");
        return;
      }
      setForm(emptyForm);
      router.refresh();
    });
  }

  function handleUpdate(id: string, patch: Partial<CategoryRow>) {
    setRowError((e) => ({ ...e, [id]: "" }));
    startTransition(async () => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        setRowError((e) => ({ ...e, [id]: "Không lưu được thay đổi." }));
        return;
      }
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    setRowError((e) => ({ ...e, [id]: "" }));
    startTransition(async () => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRowError((e) => ({
          ...e,
          [id]:
            data.error === "category_in_use"
              ? `Còn ${data.count} tài liệu thuộc danh mục này — không xóa được.`
              : "Không xóa được danh mục.",
        }));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <form
        onSubmit={handleCreate}
        className="border-line bg-paper-raised mb-8 grid gap-3 rounded-[var(--radius-tile)] border p-5 sm:grid-cols-5"
      >
        <div className="sm:col-span-2">
          <Label htmlFor="new-name">Tên chuyên đề</Label>
          <Input
            id="new-name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="new-slug">Slug</Label>
          <Input
            id="new-slug"
            required
            placeholder="hoa-13"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="new-tile">Ký hiệu</Label>
          <Input
            id="new-tile"
            required
            maxLength={3}
            placeholder="H13"
            value={form.tile}
            onChange={(e) => setForm((f) => ({ ...f, tile: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="new-group">Nhóm</Label>
          <Select
            id="new-group"
            value={form.group}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                group: e.target.value as CategoryRow["group"],
              }))
            }
          >
            {Object.entries(GROUP_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-5">
          {createError && (
            <div className="mb-2">
              <FormBanner variant="error">{createError}</FormBanner>
            </div>
          )}
          <Button type="submit" size="sm" disabled={isPending}>
            Thêm danh mục
          </Button>
        </div>
      </form>

      <ul className="divide-line border-line divide-y rounded-[var(--radius-tile)] border">
        {categories.map((category) =>
          editingId === category.id ? (
            <EditRow
              key={category.id}
              category={category}
              disabled={isPending}
              onCancel={() => setEditingId(null)}
              onSave={(patch) => handleUpdate(category.id, patch)}
            />
          ) : (
            <li
              key={category.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <span className="border-line font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-tile)] border text-xs font-semibold">
                {category.tile}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-ink text-sm">{category.name}</p>
                <p className="text-ink-soft font-mono text-xs">
                  {category.slug} · {GROUP_LABELS[category.group]} ·{" "}
                  {category.documentCount} tài liệu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingId(category.id)}
                className="text-ink-soft hover:text-flame text-xs"
              >
                Sửa
              </button>
              <button
                type="button"
                onClick={() => handleDelete(category.id)}
                disabled={isPending}
                className="text-ink-soft hover:text-alert text-xs"
              >
                Xóa
              </button>
              {rowError[category.id] && (
                <p className="text-alert w-full text-xs">
                  {rowError[category.id]}
                </p>
              )}
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function EditRow({
  category,
  disabled,
  onCancel,
  onSave,
}: {
  category: CategoryRow;
  disabled: boolean;
  onCancel: () => void;
  onSave: (patch: {
    name: string;
    tile: string;
    group: CategoryRow["group"];
  }) => void;
}) {
  const [name, setName] = useState(category.name);
  const [tile, setTile] = useState(category.tile);
  const [group, setGroup] = useState(category.group);

  return (
    <li className="bg-paper flex flex-wrap items-center gap-2 px-4 py-3">
      <Input
        value={tile}
        maxLength={3}
        onChange={(e) => setTile(e.target.value)}
        className="h-8 w-16"
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-8 flex-1"
      />
      <Select
        value={group}
        onChange={(e) => setGroup(e.target.value as CategoryRow["group"])}
        className="h-8 w-auto text-xs"
      >
        {Object.entries(GROUP_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSave({ name, tile, group })}
        className="text-flame text-xs font-medium hover:underline"
      >
        Lưu
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-ink-soft hover:text-flame text-xs"
      >
        Hủy
      </button>
    </li>
  );
}
