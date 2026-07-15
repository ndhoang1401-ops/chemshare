import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { USER_ROLES } from "@/lib/constants";

const REVIEWER_ROLES: string[] = [USER_ROLES.MODERATOR, USER_ROLES.ADMIN];

/** Dùng ở đầu Server Component — chuyển hướng về "/" nếu không phải Moderator/Admin. */
export async function requireReviewer() {
  const session = await auth();
  if (!session?.user || !REVIEWER_ROLES.includes(session.user.role)) {
    redirect("/");
  }
  return session;
}

/** Dùng ở đầu Server Component — chuyển hướng về "/" nếu không phải Admin. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== USER_ROLES.ADMIN) {
    redirect("/");
  }
  return session;
}
