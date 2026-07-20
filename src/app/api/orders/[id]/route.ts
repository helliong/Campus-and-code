import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database/prisma";
import { syncYooKassaPayment } from "@/lib/payments/paymentSync";
import { getYooKassaPayment } from "@/lib/payments/yookassa";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orderAccess = session.user.role === "SUPERADMIN"
    ? {}
    : session.user.role === "UNIVERSITY_ADMIN" && session.user.universityId
      ? { items: { some: { product: { universityId: session.user.universityId } } } }
      : { userId: session.user.id };
  let order = await prisma.order.findFirst({
    where: { id, ...orderAccess },
    select: {
      id: true,
      number: true,
      status: true,
      total: true,
      currency: true,
      createdAt: true,
      paidAt: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, test: true, cancellationReason: true, providerPaymentId: true },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const latestPayment = order.payments[0];
  if (order.status === "AWAITING_PAYMENT" && latestPayment?.providerPaymentId) {
    try {
      const providerPayment = await getYooKassaPayment(latestPayment.providerPaymentId);
      await syncYooKassaPayment(providerPayment);
      order = await prisma.order.findFirst({
        where: { id, ...orderAccess },
        select: {
          id: true, number: true, status: true, total: true, currency: true,
          createdAt: true, paidAt: true,
          payments: {
            orderBy: { createdAt: "desc" }, take: 1,
            select: { status: true, test: true, cancellationReason: true, providerPaymentId: true },
          },
        },
      });
    } catch (error) {
      console.error("Order payment reconciliation failed:", error);
    }
  }
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({
    ...order,
    payments: order.payments.map(({ providerPaymentId: _providerPaymentId, ...payment }) => payment),
  });
}
