import { NextResponse } from "next/server";
import { clearRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const clientIp = getClientIp(request);

  if (email) {
    clearRateLimit(`login-email:${email}`);
  }

  clearRateLimit(`login-ip:${clientIp}`);

  return NextResponse.json({ message: "Login rate limit cleared" });
}
