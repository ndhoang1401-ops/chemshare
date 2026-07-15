"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type UserRole } from "@/lib/constants";

export interface AdminUserRow {
  id: string;
  email: string;
  displayName: string;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  documentCount: number;
}

export function UserRow({
  user,
  isSelf,
}: {
  user: AdminUserRow;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(newRole: UserRole) {
    const previous = role;
    setRole(newRole);
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        setRole(previous);
        setError("Không đổi được vai trò.");
        return;
      }
      router.refresh();
    });
  }

  function toggleActive() {
    const next = !isActive;
    setIsActive(next);
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${user.id}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) {
        setIsActive(!next);
        setError("Không cập nhật được trạng thái.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <li className="flex flex-wrap items-center gap-4 px-4 py-3">
      <Avatar src={user.avatar} name={user.displayName} size="sm" />

      <div className="min-w-0 flex-1">
        <p className="text-ink truncate text-sm">
          {user.displayName}
          {isSelf && (
            <span className="text-ink-soft ml-1.5 text-xs">(bạn)</span>
          )}
          {!isActive && (
            <span className="bg-alert/10 text-alert ml-1.5 rounded-[var(--radius-tile)] px-1.5 py-0.5 font-mono text-[10px]">
              đã khóa
            </span>
          )}
        </p>
        <p className="text-ink-soft truncate text-xs">{user.email}</p>
      </div>

      <p className="text-ink-soft hidden font-mono text-xs sm:block">
        {user.documentCount} tài liệu
      </p>

      <Select
        value={role}
        disabled={isSelf || isPending}
        onChange={(event) => handleRoleChange(event.target.value as UserRole)}
        className="h-9 w-auto text-xs"
      >
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Button
        variant="outline"
        size="sm"
        disabled={isSelf || isPending}
        onClick={toggleActive}
      >
        {isActive ? "Khóa" : "Mở khóa"}
      </Button>

      {error && <p className="text-alert w-full text-xs">{error}</p>}
    </li>
  );
}
