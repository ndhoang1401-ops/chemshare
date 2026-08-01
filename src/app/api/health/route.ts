import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health check cho Docker/orchestrator (xem docker-compose.yml,
 * healthcheck của service "app") — không chỉ xác nhận app đang chạy
 * (điều đó thì port mở là đủ biết) mà còn xác nhận DB thật sự kết nối
 * được, vì "app sống nhưng không nói chuyện được với DB" là kiểu lỗi hay
 * gặp nhất khi mới triển khai (sai DATABASE_URL, DB chưa sẵn sàng...).
 *
 * Cố tình KHÔNG yêu cầu đăng nhập — orchestrator gọi endpoint này không
 * có cookie session.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[health] Không kết nối được database:", error);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
