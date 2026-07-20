import { CancellationInitiator, type Prisma } from "@prisma/client";
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
    const status = await cancelOrder({ where, canceledBy: CancellationInitiator.STORE });
    return NextResponse.json({ status });
  } catch (error) {
    if (error instanceof OrderCancellationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Store order cancellation failed:", error);
    return NextResponse.json({ error: "Не удалось отменить заказ. Попробуйте позже" }, { status: 502 });
  }
}
