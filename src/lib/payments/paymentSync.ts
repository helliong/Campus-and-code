import { PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";
import { createYooKassaRefund, type YooKassaPayment } from "./yookassa";
import type { ProductVariant } from "@/types";

export async function syncYooKassaPayment(providerPayment: YooKassaPayment) {
  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId: providerPayment.id },
    include: { order: { include: { items: true } } },
  });
  if (!payment) return null;

  const providerAmount = Number(providerPayment.amount.value);
  if (
    !Number.isFinite(providerAmount)
    || providerAmount !== payment.amount
    || providerPayment.amount.currency !== payment.currency
    || providerPayment.metadata?.order_id !== payment.orderId
  ) {
    throw new Error("Payment verification failed");
  }

  if (providerPayment.status === "succeeded" && payment.order.status === "CANCELED") {
    const refund = await createYooKassaRefund({
      paymentId: providerPayment.id,
      amount: payment.amount,
      orderNumber: payment.order.number,
      idempotenceKey: `order-refund-${payment.orderId}`,
    });
    if (refund.status !== "succeeded") return payment.orderId;

    const paidAt = new Date();
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCEEDED, paidAt, test: providerPayment.test },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "REFUNDED", paidAt },
      }),
    ]);
    return payment.orderId;
  }

  if (providerPayment.status === "succeeded" && payment.status !== PaymentStatus.SUCCEEDED) {
    await prisma.$transaction(async (tx) => {
      const currentPayment = await tx.payment.findUnique({ where: { id: payment.id } });
      if (!currentPayment || currentPayment.status === PaymentStatus.SUCCEEDED) return;

      for (const item of payment.order.items) {
        if (!item.productId) continue;
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;
        const variants = Array.isArray(product.variants)
          ? product.variants as unknown as ProductVariant[]
          : [];
        const nextVariants = variants.map((variant) =>
          (variant.size || null) === item.selectedSize && (variant.color || null) === item.selectedColor
            ? { ...variant, stock: Math.max(variant.stock - item.quantity, 0) }
            : variant,
        );
        const nextStock = Math.max(product.stockCount - item.quantity, 0);

        await tx.product.update({
          where: { id: product.id },
          data: {
            stockCount: nextStock,
            inStock: nextStock > 0,
            ...(variants.length > 0
              ? { variants: nextVariants as unknown as Prisma.InputJsonValue }
              : {}),
          },
        });
        await tx.cartItem.deleteMany({
          where: {
            userId: payment.order.userId,
            productId: item.productId,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          },
        });
      }

      const paidAt = new Date();
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCEEDED, paidAt, test: providerPayment.test },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID", paidAt },
      });
    });
  } else if (
    providerPayment.status === "canceled"
    && payment.status === PaymentStatus.PENDING
    && payment.order.status !== "CANCELED"
  ) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.CANCELED,
          cancellationReason: providerPayment.cancellation_details?.reason || "canceled",
        },
      }),
      prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAYMENT_FAILED" } }),
    ]);
  }

  return payment.orderId;
}
