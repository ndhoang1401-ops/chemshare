import { NextResponse } from "next/server";
import { readStoredFile } from "@/lib/storage";

/**
 * Phục vụ file cho cả 2 chế độ storage (local lẫn Vercel Blob "cloud") —
 * xem lib/storage.ts.
 *
 * CỐ Ý không kiểm tra đăng nhập ở đây: quyền truy cập được quyết định ở
 * NƠI GỌI `getDownloadUrl()` (vd. trang chi tiết tài liệu chỉ gọi hàm này
 * cho tài liệu đã duyệt hoặc khi người dùng có quyền xem; API tải xuống
 * chỉ gọi hàm này sau khi đã xác thực đăng nhập). Route này chỉ đóng vai
 * trò tương đương "ổ chứa" — bảo vệ bằng key ngẫu nhiên 96-bit không đoán
 * được (xem lib/storage.ts), không phải bằng session ở bước phục vụ. Đây
 * là thiết kế có chủ đích, giống hệt cách 1 presigned URL S3/Vercel Blob
 * signed URL hoạt động: bản thân URL đã LÀ vé truy cập, không xác thực
 * lại danh tính người bấm vào link.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;

  const file = await readStoredFile(key.join("/"));
  if (!file) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const fileName = key[key.length - 1] ?? "file";
  return new NextResponse(file.stream, {
    headers: {
      "Content-Type": file.contentType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
      // File có thể chứa nội dung nhạy cảm chờ duyệt — không cho cache ở
      // đâu ngoài chính trình duyệt người xem, luôn revalidate lại.
      "Cache-Control": "private, max-age=0, no-cache",
    },
  });
}
