import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Lớp trừu tượng lưu trữ file — chạy trên Cloudflare R2 hoặc AWS S3 khi đã
 * cấu hình đủ biến môi trường STORAGE_*, ngược lại tự động lưu vào ổ đĩa
 * cục bộ (`storage-local/`, đã gitignore) và phục vụ qua
 * `app/api/files/[...key]/route.ts`. Chế độ local giúp test toàn bộ luồng
 * upload/tải xuống ngay mà không cần tài khoản R2/S3 trước — khi deploy
 * thật, chỉ cần điền `.env` là tự chuyển sang cloud, không cần sửa code.
 */

const REQUIRED_CLOUD_VARS = [
  "STORAGE_ENDPOINT",
  "STORAGE_BUCKET",
  "STORAGE_ACCESS_KEY_ID",
  "STORAGE_SECRET_ACCESS_KEY",
] as const;

const isCloudConfigured = REQUIRED_CLOUD_VARS.every(
  (key) => !!process.env[key],
);

export const storageMode: "cloud" | "local" = isCloudConfigured
  ? "cloud"
  : "local";

const LOCAL_STORAGE_DIR = path.join(process.cwd(), "storage-local");

let cachedClient: S3Client | null = null;
function getClient(): S3Client {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: process.env.STORAGE_REGION || "auto",
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
      },
      // Bắt buộc cho R2 và phần lớn dịch vụ S3-compatible khác.
      forcePathStyle: true,
    });
  }
  return cachedClient;
}

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
    await getClient().send(
      new PutObjectCommand({
        Bucket: process.env.STORAGE_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return key;
  }

  const filePath = localPathFor(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return key;
}

/**
 * Trả về URL để tải/xem file (presigned URL có hạn dùng nếu cloud, hoặc
 * route nội bộ có kiểm tra đăng nhập nếu đang ở chế độ local).
 */
export async function getDownloadUrl(
  key: string,
  expiresInSeconds = 300,
): Promise<string> {
  if (storageMode === "cloud") {
    const command = new GetObjectCommand({
      Bucket: process.env.STORAGE_BUCKET!,
      Key: key,
    });
    return getSignedUrl(getClient(), command, {
      expiresIn: expiresInSeconds,
    });
  }

  return `/api/files/${key}`;
}

/** Đọc file trực tiếp từ ổ đĩa cục bộ — chỉ dùng bởi app/api/files/[...key], không dùng ở chế độ cloud. */
export async function readLocalFile(key: string): Promise<Buffer> {
  const filePath = localPathFor(key);
  return readFile(filePath);
}

export async function deleteFile(key: string): Promise<void> {
  if (storageMode === "cloud") {
    await getClient().send(
      new DeleteObjectCommand({
        Bucket: process.env.STORAGE_BUCKET!,
        Key: key,
      }),
    );
    return;
  }

  await unlink(localPathFor(key)).catch(() => {
    // Không tồn tại thì thôi, không cần báo lỗi.
  });
}
