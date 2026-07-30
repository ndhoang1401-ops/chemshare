import { randomBytes } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { generateUniqueSlug } from "@/lib/slug";
import { ACCEPTED_DOCUMENT_TYPES } from "@/lib/constants";
import { parseKeywords, uploadDocumentSchema } from "@/lib/validators/document";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const MAX_SIZE_BYTES =
  (Number(process.env.UPLOAD_MAX_SIZE_MB) || 25) * 1024 * 1024;

const EXTENSION_BY_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
};

function sanitizeBaseName(name: string): string {
  const withoutExt = name.replace(/\.[^./]+$/, "");
  const safe = withoutExt.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return safe || "tai-lieu";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Khoá theo user (không theo IP) — chính xác hơn cho endpoint đã yêu
  // cầu đăng nhập: nhiều người dùng sau cùng 1 NAT/IP công ty/trường học
  // không bị ảnh hưởng lẫn nhau.
  const limited = rateLimit(`upload:${session.user.id}`, RATE_LIMITS.upload);
  if (!limited.allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message:
          "Bạn đã đăng quá nhiều tài liệu trong thời gian ngắn, vui lòng thử lại sau.",
        retryAfterSeconds: limited.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const parsed = uploadDocumentSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    keywords: formData.get("keywords"),
    categoryId: formData.get("categoryId"),
    grade: formData.get("grade"),
    author: formData.get("author"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation_error",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "empty_file" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: "file_too_large",
        maxSizeMb: Number(process.env.UPLOAD_MAX_SIZE_MB) || 25,
      },
      { status: 413 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return NextResponse.json(
      {
        error: "validation_error",
        fieldErrors: { categoryId: ["Chuyên đề không tồn tại"] },
      },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Kiểm tra loại file THẬT dựa vào nội dung (magic bytes / cấu trúc
  // OOXML bên trong), không tin vào Content-Type hay đuôi file client gửi
  // lên — cả hai đều dễ dàng giả mạo.
  const detected = await fileTypeFromBuffer(buffer);
  if (
    !detected ||
    !(ACCEPTED_DOCUMENT_TYPES as readonly string[]).includes(detected.mime)
  ) {
    return NextResponse.json(
      {
        error: "invalid_file_type",
        message: "Chỉ chấp nhận file PDF, DOCX hoặc PPTX.",
      },
      { status: 400 },
    );
  }

  const slug = generateUniqueSlug(parsed.data.title);
  const storageId = randomBytes(12).toString("hex");
  const extension = EXTENSION_BY_MIME[detected.mime] ?? detected.ext;
  const storageKey = `documents/${storageId}/${sanitizeBaseName(file.name)}.${extension}`;

  try {
    await uploadFile(storageKey, buffer, detected.mime);

    const document = await prisma.document.create({
      data: {
        slug,
        title: parsed.data.title,
        description: parsed.data.description || null,
        keywords: parseKeywords(parsed.data.keywords),
        author: parsed.data.author || null,
        grade: parsed.data.grade || null,
        categoryId: parsed.data.categoryId,
        uploaderId: session.user.id,
        fileUrl: storageKey,
        fileName: file.name,
        fileType: detected.mime,
        fileSize: buffer.length,
        status: "PENDING",
      },
      select: { id: true, slug: true, title: true },
    });

    return NextResponse.json({ ok: true, document }, { status: 201 });
  } catch (error) {
    console.error("[api/documents]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
