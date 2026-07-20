import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database/prisma";
import {
  calculateOrderPrice,
  isDeliveryMethod,
} from "@/lib/orders/orderPricing";
import { createYooKassaPayment } from "@/lib/payments/yookassa";
import type { ProductVariant } from "@/types";

type CheckoutItem = {
  productId?: unknown;
  quantity?: unknown;
  selectedSize?: unknown;
  selectedColor?: unknown;
};

function optionalString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) || null : null;
}

function getOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `CC-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json({ error: "Войдите в аккаунт для оформления заказа" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items as CheckoutItem[] : [];
    const email = optionalString(body.email, 254);
    const phone = optionalString(body.phone, 32);
    const address = optionalString(body.address, 500);

    if (items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: "Корзина пуста или содержит слишком много позиций" }, { status: 400 });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || !phone || !address) {
      return NextResponse.json({ error: "Заполните email, телефон и адрес доставки" }, { status: 400 });
    }
    if (!isDeliveryMethod(body.deliveryMethod)) {
      return NextResponse.json({ error: "Некорректный способ доставки" }, { status: 400 });
    }
    if (body.paymentMethod !== "card") {
      return NextResponse.json({ error: "В тестовом режиме доступна только оплата картой" }, { status: 400 });
    }

    const normalizedItems = items.map((item) => ({
      productId: typeof item.productId === "string" ? item.productId : "",
      quantity: Number(item.quantity),
      selectedSize: optionalString(item.selectedSize, 50),
      selectedColor: optionalString(item.selectedColor, 50),
    }));
    if (normalizedItems.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
      return NextResponse.json({ error: "Некорректные позиции корзины" }, { status: 400 });
    }

    const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
    const [user, products] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }),
      prisma.product.findMany({ where: { id: { in: productIds }, isPublished: true } }),
    ]);
    if (!user || products.length !== productIds.length) {
      return NextResponse.json({ error: "Некоторые товары больше недоступны" }, { status: 409 });
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const orderItems = normalizedItems.map((item) => {
      const product = productMap.get(item.productId)!;
      if (item.selectedSize && !product.availableSizes.includes(item.selectedSize)) {
        throw new Error(`SIZE_UNAVAILABLE:${product.name}`);
      }
      if (item.selectedColor && !product.availableColors.includes(item.selectedColor)) {
        throw new Error(`COLOR_UNAVAILABLE:${product.name}`);
      }

      const variants = Array.isArray(product.variants)
        ? product.variants as unknown as ProductVariant[]
        : [];
      const variant = variants.find(
        (candidate) =>
          (candidate.size || null) === item.selectedSize &&
          (candidate.color || null) === item.selectedColor,
      );
      const availableStock = variant?.stock ?? product.stockCount;
      if (!product.inStock || availableStock < item.quantity) {
        throw new Error(`OUT_OF_STOCK:${product.name}`);
      }

      const imagesByColor = product.imagesByColor && typeof product.imagesByColor === "object"
        ? product.imagesByColor as Record<string, string[]>
        : {};
      const imageUrl = (item.selectedColor && imagesByColor[item.selectedColor]?.[0])
        || product.images[0]
        || product.imageUrl;

      return {
        productId: product.id,
        productName: product.name,
        productSku: variant?.sku || product.sku,
        imageUrl,
        unitPrice: product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        lineTotal: product.price * item.quantity,
      };
    });
    const productsTotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const pricing = calculateOrderPrice({
      productsTotal,
      role: user.role,
      deliveryMethod: body.deliveryMethod,
      promoCode: optionalString(body.promoCode, 50) || undefined,
    });
    const idempotenceKey = randomUUID();
    const order = await prisma.order.create({
      data: {
        number: getOrderNumber(),
        userId: session.user.id,
        contactEmail: email,
        contactPhone: phone,
        deliveryMethod: body.deliveryMethod,
        deliveryAddress: address,
        deliveryPrice: pricing.deliveryPrice,
        productsTotal: pricing.productsTotal,
        studentDiscount: pricing.studentDiscount,
        promoCode: pricing.promoCode,
        promoDiscount: pricing.promoDiscount,
        total: pricing.total,
        comment: optionalString(body.comment, 1000),
        items: { create: orderItems },
        payments: {
          create: { idempotenceKey, amount: pricing.total },
        },
      },
      include: { payments: true },
    });

    try {
      const yooPayment = await createYooKassaPayment({
        amount: order.total,
        orderId: order.id,
        orderNumber: order.number,
        idempotenceKey,
      });
      const confirmationUrl = yooPayment.confirmation?.confirmation_url;
      if (!confirmationUrl) throw new Error("YooKassa did not return confirmation_url");

      await prisma.payment.update({
        where: { id: order.payments[0].id },
        data: {
          providerPaymentId: yooPayment.id,
          confirmationUrl,
          test: yooPayment.test,
        },
      });

      return NextResponse.json({ orderId: order.id, confirmationUrl });
    } catch (error) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: order.payments[0].id },
          data: { status: "CANCELED", cancellationReason: "provider_request_failed" },
        }),
        prisma.order.update({ where: { id: order.id }, data: { status: "PAYMENT_FAILED" } }),
      ]);
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("SIZE_UNAVAILABLE:") || message.startsWith("COLOR_UNAVAILABLE:")) {
      return NextResponse.json({ error: `Выбранный вариант товара недоступен: ${message.split(":")[1]}` }, { status: 409 });
    }
    if (message.startsWith("OUT_OF_STOCK:")) {
      return NextResponse.json({ error: `Недостаточно товара: ${message.split(":")[1]}` }, { status: 409 });
    }
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Не удалось создать заказ и платёж" }, { status: 500 });
  }
}
