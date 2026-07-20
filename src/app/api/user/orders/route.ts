import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      number: true,
      status: true,
      total: true,
      deliveryAddress: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productName: true,
          imageUrl: true,
          quantity: true,
          selectedSize: true,
          selectedColor: true,
          product: { select: { slug: true } },
        },
      },
    },
  });

  return NextResponse.json({ orders });
}
