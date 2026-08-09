import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";

/**
 * Lớp trừu tượng lưu trữ file — chạy trên Vercel Blob (private store) khi
 * đã kết nối store vào project (Vercel tự thêm biến
 * `BLOB_READ_WRITE_TOKEN`), ngược lại tự động lưu vào ổ đĩa cục bộ
 * (`storage-local/`, đã gitignore) và phục vụ qua
 * `app/api/files/[...key]/route.ts`. Chế độ local giúp test toàn bộ luồng
 * upload/tải xuống ngay mà không cần tài khoản Vercel trước — khi deploy
 * thật và kết nối Blob store, chỉ cần biến môi trường là tự chuyển sang
 * cloud, không cần sửa code.
 *
 * (Trước đây dùng S3-compatible client cho Cloudflare R2/AWS S3 — đổi
 * sang Vercel Blob khi chuyển hướng triển khai từ Docker sang Vercel, vì
 * Vercel Blob không cần tạo thêm tài khoản/dịch vụ ngoài. Xem
 * NEXTJS_NOTES.md mục 18.)
 */

const isCloudConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;

export const storageMode: "cloud" | "local" = isCloudConfigured
  ? "cloud"
  : "local";

const LOCAL_STORAGE_DIR = path.join(process.cwd(), "storage-local");

function localPathFor(key: string): string {
  const resolved = path.join(LOCAL_STORAGE_DIR, key);
  // Chống path traversal (vd. key chứa "../../etc/passwd").
  if (!resolved.startsWith(LOCAL_STORAGE_DIR + path.sep)) {
    throw new Error("Đường dẫn file không hợp lệ");
  }
  return resolved;
}

/** Upload buffer lên storage, trả về storage key đã lưu (lưu vào cột fileUrl trong DB). */
export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  if (storageMode === "cloud") {
    await put(key, buffer, {
      access: "private",
      contentType,
      // key đã là chuỗi ngẫu nhiên 96-bit duy nhất tự sinh từ trước lúc
      // gọi hàm này (xem app/api/documents/route.ts) — không cần Vercel
      // Blob thêm suffix ngẫu nhiên nữa.
      addRandomSuffix: false,
    });
    return key;
  }

  const filePath = localPathFor(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return key;
}

/**
 * URL để trình duyệt tải/xem file — LUÔN đi qua route nội bộ
 * `/api/files/[...key]` bất kể đang ở chế độ nào.
 *
 * (Bản trước dùng presigned URL trả trực tiếp từ S3/R2 khi ở chế độ
 * cloud. Vercel Blob private cũng hỗ trợ signed URL tương đương
 * (`issueSignedToken`/`presignUrl`), nhưng phức tạp hơn cần thiết cho quy
 * mô app này — route nội bộ đơn giản hơn và tái dùng được đúng lớp bảo
 * mật "key ngẫu nhiên không đoán được, không kiểm tra session lại ở bước
 * phục vụ" đã thiết kế sẵn cho chế độ local, giờ dùng chung cho cả 2 chế
 * độ. Quyền truy cập vẫn được quyết định ở NƠI GỌI hàm này, xem comment
 * trong app/api/files/[...key]/route.ts.)
 */
export async function getDownloadUrl(key: string): Promise<string> {
  return `/api/files/${key}`;
}

/**
 * Đọc file thật từ storage (cục bộ hoặc Vercel Blob) — dùng bởi
 * app/api/files/[...key]/route.ts để stream trả về response. Trả về
 * ReadableStream (không phải Buffer) để không cần tải nguyên file vào bộ
 * nhớ server trước khi gửi đi — quan trọng với file lớn (PDF/PPTX vài
 * chục MB).
 */
export async function readStoredFile(key: string): Promise<{
  stream: ReadableStream<Uint8Array>;
  contentType: string | null;
} | null> {
  if (storageMode === "cloud") {
    const result = await get(key, { access: "private" });
    if (!result?.stream) return null;
    return { stream: result.stream, contentType: result.blob.contentType };
  }

  try {
    const buffer = await readFile(localPathFor(key));
    // Bọc Buffer thành ReadableStream để cùng interface với nhánh cloud —
    // route xử lý cả 2 nhánh giống hệt nhau ở phía sau hàm này.
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(buffer));
        controller.close();
      },
    });
    return { stream, contentType: null };
  } catch {
    return null;
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (storageMode === "cloud") {
    // del() của Vercel Blob vốn đã không ném lỗi nếu key không tồn tại —
    // vẫn catch thêm để lỗi mạng/khác không làm vỡ luồng xoá tài liệu.
    await del(key).catch(() => {});
    return;
  }

  await unlink(localPathFor(key)).catch(() => {
    // Không tồn tại thì thôi, không cần báo lỗi.
  });
}
