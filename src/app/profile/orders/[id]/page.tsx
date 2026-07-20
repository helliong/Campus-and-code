import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database/prisma";
import { isOrderCancellable } from "@/lib/orders/orderCancellation";
import CancelOrderButton from "./CancelOrderButton";
import "./page.scss";

const statusLabels: Record<string, string> = {
  AWAITING_PAYMENT: "Ожидает оплаты", PAID: "Оплачен", PROCESSING: "Собирается",
  SHIPPED: "В пути", DELIVERED: "Доставлен", CANCELED: "Отменён",
  PAYMENT_FAILED: "Оплата не прошла", REFUNDED: "Возврат",
};

export default async function ProfileOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) redirect("/login");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) notFound();

  return (
    <div className="profile-order-details">
      <Link href="/profile/orders">← Все заказы</Link>
      <header>
        <div><small>Заказ</small><h1>№{order.number}</h1></div>
        <div className="order-status-actions">
          <span>{statusLabels[order.status]}</span>
          {isOrderCancellable(order.status) && <CancelOrderButton orderId={order.id} orderNumber={order.number} />}
        </div>
      </header>
      <section>
        <h2>Состав заказа</h2>
        {order.items.map((item) => (
          <article key={item.id}>
            <Image src={item.imageUrl} alt={item.productName} width={72} height={72} />
            <div><strong>{item.productName}</strong><span>{[item.selectedColor, item.selectedSize].filter(Boolean).join(", ") || "Без варианта"}</span></div>
            <span>{item.quantity} шт.</span><strong>{item.lineTotal.toLocaleString("ru-RU")} ₽</strong>
          </article>
        ))}
      </section>
      <section className="order-summary"><div><span>Доставка</span><strong>{order.deliveryPrice.toLocaleString("ru-RU")} ₽</strong></div><div><span>Адрес</span><strong>{order.deliveryAddress}</strong></div><div className="total"><span>Итого</span><strong>{order.total.toLocaleString("ru-RU")} ₽</strong></div></section>
      {order.payments[0]?.test && <p className="test-note">Заказ оплачивался через тестовый магазин ЮKassa.</p>}
    </div>
  );
}
