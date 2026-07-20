import { randomUUID } from "node:crypto";
import { PaymentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database/prisma";
import { isOrderPayable } from "@/lib/orders/orderCancellation";
import { syncYooKassaPayment } from "@/lib/payments/paymentSync";
import { createYooKassaPayment, getYooKassaPayment } from "@/lib/payments/yookassa";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }
  if (!isOrderPayable(order.status)) {
    return NextResponse.json({ error: "Этот заказ уже нельзя оплатить" }, { status: 409 });
  }

  const latestPayment = order.payments[0];
  if (latestPayment?.providerPaymentId && latestPayment.status === PaymentStatus.PENDING) {
    try {
      const providerPayment = await getYooKassaPayment(latestPayment.providerPaymentId);
      if (providerPayment.status === "succeeded") {
        await syncYooKassaPayment(providerPayment);
        return NextResponse.json({ error: "Заказ уже оплачен" }, { status: 409 });
      }
      if (providerPayment.status === "pending") {
        const confirmationUrl = providerPayment.confirmation?.confirmation_url || latestPayment.confirmationUrl;
        if (confirmationUrl) return NextResponse.json({ confirmationUrl });
      }
      if (providerPayment.status === "waiting_for_capture") {
        return NextResponse.json({ error: "Платёж уже обрабатывается" }, { status: 409 });
      }
    } catch (error) {
      console.error("Payment status check failed:", error);
      return NextResponse.json({ error: "Не удалось проверить предыдущий платёж" }, { status: 502 });
    }
  }

  const idempotenceKey = randomUUID();
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      idempotenceKey,
      amount: order.total,
      currency: order.currency,
    },
  });

  try {
    const providerPayment = await createYooKassaPayment({
      amount: order.total,
      orderId: order.id,
      orderNumber: order.number,
      idempotenceKey,
    });
    const confirmationUrl = providerPayment.confirmation?.confirmation_url;
    if (!confirmationUrl) throw new Error("YooKassa did not return confirmation_url");

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: providerPayment.id,
          confirmationUrl,
          test: providerPayment.test,
        },
      }),
      prisma.order.update({ where: { id: order.id }, data: { status: "AWAITING_PAYMENT" } }),
    ]);
    return NextResponse.json({ confirmationUrl });
  } catch (error) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.CANCELED, cancellationReason: "provider_request_failed" },
    });
    console.error("Payment retry creation failed:", error);
    return NextResponse.json({ error: "Не удалось создать повторный платёж" }, { status: 502 });
  }
}
