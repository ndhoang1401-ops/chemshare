import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationList } from "@/components/notifications/notification-list";

export const metadata: Metadata = {
  title: "Thông báo",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/notifications");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-semibold">Thông báo</h1>
      <NotificationList
        notifications={notifications.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
