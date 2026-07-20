import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database/prisma";
import { isOrderCancellable } from "@/lib/orders/orderCancellation";
import { isOrderDeliverable } from "@/lib/orders/orderDelivery";
import AdminCancelOrderButton from "./AdminCancelOrderButton";
import AdminDeliverOrderButton from "./AdminDeliverOrderButton";
import "./page.scss";

const statusLabels: Record<string, string> = {
  AWAITING_PAYMENT: "Ожидает оплаты",
  PAID: "Оплачен",
  PROCESSING: "Собирается",
  SHIPPED: "Передан в доставку",
  DELIVERED: "Доставлен",
  CANCELED: "Отменён",
  PAYMENT_FAILED: "Ошибка оплаты",
  REFUNDED: "Возвращён",
};
const dateFormatter = new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  const scopedUniversityId = session?.user.role === "UNIVERSITY_ADMIN"
    ? session.user.universityId || "__missing_university__"
    : undefined;
  const where: Prisma.OrderWhereInput = scopedUniversityId
    ? { items: { some: { product: { universityId: scopedUniversityId } } } }
    : {};
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { productName: true, quantity: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1, select: { test: true } },
    },
  });

  return (
    <div className="admin-orders-page">
      <header><h1>Заказы</h1><p>Оплаты и заказы пользователей магазина.</p></header>
      <section className="orders-table-card">
        {orders.length > 0 ? (
          <div className="orders-table-scroll">
            <table>
              <thead><tr><th>Заказ</th><th>Покупатель</th><th>Статус</th><th>Товары</th><th>Сумма</th><th>Создан</th><th>Действия</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.number}</strong>{order.payments[0]?.test && <small>Тест</small>}</td>
                    <td><span>{order.user.name || "Без имени"}</span><small>{order.user.email}</small></td>
                    <td>
                      <span className={`order-status ${order.status.toLowerCase()}`}>
                        {["CANCELED", "REFUNDED"].includes(order.status) && order.canceledBy
                          ? order.canceledBy === "CUSTOMER" ? "Отменён покупателем" : "Отменён магазином"
                          : statusLabels[order.status]}
                      </span>
                    </td>
                    <td>
                      <div className="order-products-cell">
                        {order.items.map((item, index) => (
                          <span key={`${item.productName}-${index}`}>
                            {item.productName} <small>× {item.quantity}</small>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{order.total.toLocaleString("ru-RU")} ₽</td>
                    <td>{dateFormatter.format(order.createdAt)}</td>
                    <td>
                      <div className="admin-order-actions">
                        {isOrderDeliverable(order.status) && (
                          <AdminDeliverOrderButton orderId={order.id} orderNumber={order.number} />
                        )}
                        {isOrderCancellable(order.status) && (
                          <AdminCancelOrderButton orderId={order.id} orderNumber={order.number} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="orders-empty">Заказов пока нет</div>}
      </section>
    </div>
  );
}
