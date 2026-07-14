import { NextResponse } from "next/server";
import { readLocalFile, storageMode } from "@/lib/storage";

/**
 * Chỉ thực sự phục vụ file khi storage đang ở chế độ "local" (chưa cấu
 * hình R2/S3 — xem lib/storage.ts). Ở chế độ "cloud", tải file luôn đi
 * qua presigned URL trực tiếp từ R2/S3, route này sẽ không được gọi tới.
 *
 * CỐ Ý không kiểm tra đăng nhập ở đây: một presigned URL S3/R2 thật, một
 * khi đã được server sinh ra, cũng không tự xác thực lại danh tính người
 * bấm vào link — quyền truy cập được quyết định ở NƠI GỌI
 * `getDownloadUrl()` (vd. trang chi tiết tài liệu chỉ gọi hàm này cho
 * tài liệu đã duyệt hoặc khi người dùng có quyền xem; API tải xuống chỉ
 * gọi hàm này sau khi đã xác thực đăng nhập). Route này chỉ đóng vai trò
 * tương đương "ổ chứa" — bảo vệ bằng key ngẫu nhiên 96-bit không đoán
 * được (xem lib/storage.ts), không phải bằng session ở bước phục vụ.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  if (storageMode !== "local") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
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
