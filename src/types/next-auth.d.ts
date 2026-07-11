import type { DefaultSession, DefaultUser } from "next-auth";
import type { UserRole } from "@/lib/constants";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: UserRole;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
