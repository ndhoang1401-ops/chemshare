import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface LogActivityInput {
  userId?: string | null;
  /** Vd: "document.approve", "document.reject", "user.role_change" */
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Ghi một dòng nhật ký hoạt động (hiển thị ở trang quản trị — Giai đoạn 9).
 * Cố ý nuốt lỗi thay vì throw: ghi log thất bại không được phép làm hỏng
 * thao tác chính (vd. duyệt tài liệu vẫn phải thành công dù activity log
 * gặp sự cố).
 */
export async function logActivity({
  userId,
  action,
  targetType,
  targetId,
  metadata,
}: LogActivityInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId ?? null,
        action,
        targetType,
        targetId,
        metadata,
      },
    });
  } catch (error) {
    console.error("[activity-log]", error);
  }
}
