import { CancellationInitiator, OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";
import { createYooKassaRefund, getYooKassaPayment } from "@/lib/payments/yookassa";
import type { ProductVariant } from "@/types";
import { isOrderCancellable } from "./orderCancellation";

export class OrderCancellationError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function cancelOrder({
  where,
  canceledBy,
}: {
  where: Prisma.OrderWhereInput;
  canceledBy: CancellationInitiator;
}) {
  const order = await prisma.order.findFirst({
    where,
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!order) throw new OrderCancellationError("Заказ не найден", 404);
  if (!isOrderCancellable(order.status)) {
    throw new OrderCancellationError("Этот заказ уже нельзя отменить", 409);
  }

  if (order.status === OrderStatus.AWAITING_PAYMENT) {
    const updated = await prisma.order.updateMany({
      where: { id: order.id, status: OrderStatus.AWAITING_PAYMENT },
      data: { status: OrderStatus.CANCELED, canceledBy },
    });
    if (updated.count === 0) {
      throw new OrderCancellationError("Статус заказа уже изменился", 409);
    }
    return OrderStatus.CANCELED;
  }

  const payment = order.payments[0];
  if (!payment?.providerPaymentId) {
    throw new OrderCancellationError("Не удалось найти оплату заказа", 409);
  }

  const providerPayment = await getYooKassaPayment(payment.providerPaymentId);
  if (providerPayment.status !== "succeeded") {
    throw new OrderCancellationError("Платеж ещё не готов к возврату", 409);
  }

  const refund = await createYooKassaRefund({
    paymentId: payment.providerPaymentId,
    amount: order.total,
    orderNumber: order.number,
    idempotenceKey: `order-refund-${order.id}`,
  });
  if (refund.status !== "succeeded") {
    throw new OrderCancellationError("Возврат ещё обрабатывается ЮKassa", 409);
  }

  const wasRefunded = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: {
        id: order.id,
        status: { in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED] },
      },
      data: { status: OrderStatus.REFUNDED, canceledBy },
    });
    if (updated.count === 0) return false;

    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const variants = Array.isArray(product.variants)
        ? product.variants as unknown as ProductVariant[]
        : [];
      const nextVariants = variants.map((variant) =>
        (variant.size || null) === item.selectedSize && (variant.color || null) === item.selectedColor
          ? { ...variant, stock: variant.stock + item.quantity }
          : variant,
      );
      const nextStock = product.stockCount + item.quantity;

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
    }
    return true;
  });

  if (!wasRefunded) {
    throw new OrderCancellationError("Статус заказа уже изменился", 409);
  }
  return OrderStatus.REFUNDED;
}
