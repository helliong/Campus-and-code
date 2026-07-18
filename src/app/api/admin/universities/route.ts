import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const universities = await prisma.university.findMany({
    select: {
      id: true,
      shortName: true,
      name: true,
    },
    orderBy: { shortName: "asc" },
  });

  return NextResponse.json(universities);
}
