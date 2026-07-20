import { CancellationInitiator } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cancelOrder, OrderCancellationError } from "@/lib/orders/cancelOrder";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const status = await cancelOrder({
      where: { id, userId: session.user.id },
      canceledBy: CancellationInitiator.CUSTOMER,
    });
    return NextResponse.json({ status });
  } catch (error) {
    if (error instanceof OrderCancellationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Customer order cancellation failed:", error);
    return NextResponse.json({ error: "Не удалось отменить заказ. Попробуйте позже" }, { status: 502 });
  }
}
