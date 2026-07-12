import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readLocalFile, storageMode } from "@/lib/storage";

/**
 * Chỉ thực sự phục vụ file khi storage đang ở chế độ "local" (chưa cấu
 * hình R2/S3 — xem lib/storage.ts). Ở chế độ "cloud", tải file luôn đi
 * qua presigned URL trực tiếp từ R2/S3, route này sẽ không được gọi tới.
 *
 * Đây là điểm kiểm tra đăng nhập cho chế độ local, tương đương vai trò mà
 * presigned URL đảm nhiệm ở chế độ cloud (chỉ người có URL còn hạn mới
 * xem được). Kiểm tra "tài liệu đã duyệt hay chưa" thuộc về tầng gọi
 * (Giai đoạn 7/8), không phải route lưu trữ mức thấp này.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  if (storageMode !== "local") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { key } = await params;

  try {
    const buffer = await readLocalFile(key.join("/"));
    const fileName = key[key.length - 1] ?? "file";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, max-age=0, no-cache",
      },
    });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
