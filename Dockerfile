# syntax=docker.io/docker/dockerfile:1
#
# Dockerfile production cho "Nguyên Tố" — 3 giai đoạn (deps/builder/
# runner), dựa theo mẫu chính thức của Next.js team
# (github.com/vercel/next.js/tree/canary/examples/with-docker), chỉnh lại
# 2 chỗ riêng cho project này:
#   1. Thêm bước `prisma generate` trước `next build` (bắt buộc — code
#      import types từ @prisma/client, thiếu bước này build sẽ lỗi ngay).
#   2. Dùng DATABASE_URL giả (build ARG) chỉ để `prisma generate` chạy
#      được — lệnh này KHÔNG kết nối database thật, chỉ đọc schema. Giá
#      trị DATABASE_URL THẬT truyền lúc `docker compose up` (runtime),
#      không phải lúc build image. Xem NEXTJS_NOTES.md mục 15 để biết vì
#      sao cần tách 2 việc build-time/run-time này.
#
# Node 22 (không dùng bản 24 mới hơn trong mẫu chính thức) vì toàn bộ dự
# án từ Giai đoạn 0 đã phát triển/test trên Node 22 — build production
# nên khớp đúng version đã kiểm chứng, tránh lệch hành vi khó lường.

ARG NODE_VERSION=22-slim

# ============================================
# Giai đoạn 1: cài dependencies
# ============================================
FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ============================================
# Giai đoạn 2: build (prisma generate + next build)
# ============================================
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
# Chỉ dùng để `prisma generate` chạy qua bước validate config — không
# kết nối thật, không cần đúng cú pháp Postgres thật.
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate

# next.config.ts có `output: "standalone"` — build ra .next/standalone
# chỉ chứa file thật sự cần cho runtime.
RUN npm run build

# ============================================
# Giai đoạn 3: chạy ứng dụng (image cuối, gọn nhẹ)
# ============================================
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Ảnh base "slim" thiếu curl — dùng cho healthcheck trong
# docker-compose.yml.
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=node:node /app/public ./public

RUN mkdir .next && chown node:node .next

# Thư mục lưu file cục bộ khi STORAGE_PROVIDER để trống (xem
# lib/storage.ts) — tạo sẵn + đúng quyền cho user "node" (không phải
# root) TRƯỚC KHI docker-compose.yml mount volume vào đây. Docker giữ lại
# quyền thư mục có sẵn trong image khi mount volume named rỗng đè lên —
# thiếu bước này sẽ lỗi "permission denied" khi app cố ghi file.
RUN mkdir storage-local && chown node:node storage-local

# output: standalone tự trace + gom đúng node_modules cần thiết (bao gồm
# cả @prisma/client đã generate ở bước trên, vì next.config.ts có khai
# serverExternalPackages: ["@prisma/client", "pg"] — Next.js biết phải
# copy nguyên 2 package này thay vì cố bundle).
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Prisma migrate deploy (chạy ở service "migrate" riêng trong
# docker-compose.yml, KHÔNG tự chạy trong image này) cần Prisma CLI đầy
# đủ (devDependency, không có trong .next/standalone) — service đó build
# tới stage `builder` ở trên, không dùng stage `runner` này. Xem
# docker-compose.yml.

USER node

EXPOSE 3000

CMD ["node", "server.js"]
