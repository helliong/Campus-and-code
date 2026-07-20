import { OrderStatus, type Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database/prisma";
import { isOrderDeliverable } from "@/lib/orders/orderDelivery";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "UNIVERSITY_ADMIN" && session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const where: Prisma.OrderWhereInput = session.user.role === "SUPERADMIN"
    ? { id }
    : session.user.universityId
      ? { id, items: { some: { product: { universityId: session.user.universityId } } } }
      : { id: "__unavailable_order__" };

  try {
    const order = await prisma.order.findFirst({
      where,
      select: { id: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }
    if (!isOrderDeliverable(order.status)) {
      return NextResponse.json(
        { error: "Этот заказ нельзя отметить доставленным" },
        { status: 409 },
      );
    }

    const updated = await prisma.order.updateMany({
      where: { id: order.id, status: order.status },
      data: { status: OrderStatus.DELIVERED },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Статус заказа уже изменился. Обновите страницу" },
        { status: 409 },
      );
    }

    return NextResponse.json({ status: OrderStatus.DELIVERED });
  } catch (error) {
    console.error("Store order delivery update failed:", error);
    return NextResponse.json(
      { error: "Не удалось обновить заказ. Попробуйте позже" },
      { status: 500 },
    );
  }
}
