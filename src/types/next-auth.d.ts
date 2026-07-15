import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      universityId?: string | null;
    } & DefaultSession["user"];
  }
}
