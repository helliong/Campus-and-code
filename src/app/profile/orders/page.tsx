"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import "./page.scss";

type OrderStatus = "processing" | "in_transit" | "delivered" | "cancelled";

interface OrderProduct {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  imageUrl: string;
}

interface OrderPreview {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  totalPrice: number;
  deliveryAddress: string;
  deliveryDate: string;
  products: OrderProduct[];
}

const orders: OrderPreview[] = [];

const statusMeta: Record<
  OrderStatus,
  { label: string; className: string; step: number }
> = {
  processing: { label: "Собирается", className: "status-processing", step: 1 },
  in_transit: { label: "В пути", className: "status-in-transit", step: 2 },
  delivered: { label: "Доставлен", className: "status-delivered", step: 3 },
  cancelled: { label: "Отменен", className: "status-cancelled", step: 0 },
};

const orderTabs = [
  { label: "Все", value: orders.length },
  {
    label: "Активные",
    value: orders.filter((order) => order.status !== "delivered").length,
  },
  {
    label: "Доставленные",
    value: orders.filter((order) => order.status === "delivered").length,
  },
  {
    label: "Отмененные",
    value: orders.filter((order) => order.status === "cancelled").length,
  },
];

const formatPrice = (price: number) => `${price.toLocaleString("ru-RU")} ₽`;

export default function ProfileOrdersPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const activeOrders = orders.filter((order) => order.status !== "delivered");

  return (
    <div className="profile-orders-page">
      <section className="orders-heading-card">
        <div>
          <span className="section-kicker">Мои заказы</span>
          <h2>История покупок и текущие доставки</h2>
          <p>
            Здесь будут статусы заказов, состав покупки, адрес доставки и быстрые
            действия для повторного заказа.
          </p>
        </div>
        <Link href="/catalog" className="catalog-link">
          В каталог
        </Link>
      </section>

      <section className="orders-summary-grid" aria-label="Сводка по заказам">
        <div className="summary-card">
          <span className="summary-label">Всего заказов</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Активные</span>
          <strong>{activeOrders.length}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Потрачено</span>
          <strong>{formatPrice(totalSpent)}</strong>
        </div>
      </section>

      <section className="orders-panel">
        <div className="orders-toolbar">
          <div className="orders-tabs" role="tablist" aria-label="Фильтр заказов">
            {orderTabs.map((tab, index) => (
              <button
                key={tab.label}
                type="button"
                className={`orders-tab ${index === 0 ? "active" : ""}`}
              >
                {tab.label}
                <span>{tab.value}</span>
              </button>
            ))}
          </div>
          <button className="orders-filter-btn" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
            </svg>
            Фильтр
          </button>
        </div>

        <div className="orders-list">
          {orders.length > 0 ? (
            orders.map((order) => {
            const meta = statusMeta[order.status];

            return (
              <article className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div>
                    <span className="order-number">Заказ №{order.orderNumber}</span>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <span className={`order-status ${meta.className}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="order-progress" aria-label="Статус доставки">
                  {["Оформлен", "Собирается", "В пути", "Получен"].map(
                    (step, index) => (
                      <div
                        className={`progress-step ${
                          meta.step >= index ? "completed" : ""
                        }`}
                        key={step}
                      >
                        <span className="progress-dot" />
                        <span className="progress-label">{step}</span>
                      </div>
                    ),
                  )}
                </div>

                <div className="order-products">
                  {order.products.map((product) => (
                    <div className="order-product" key={product.id}>
                      <div className="product-image">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <strong>{product.name}</strong>
                        <span>
                          {product.variant} · {product.quantity} шт.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="delivery-info">
                    <span>{order.deliveryDate}</span>
                    <p>{order.deliveryAddress}</p>
                  </div>
                  <div className="order-actions">
                    <strong>{formatPrice(order.totalPrice)}</strong>
                    <Link href={`/profile/orders/${order.id}`}>Подробнее</Link>
                    <button type="button">Повторить</button>
                  </div>
                </div>
              </article>
            );
            })
          ) : (
            <div className="orders-empty-state">
              <div className="empty-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div>
                <h3>У вас пока нет заказов</h3>
                <p>
                  После оформления покупки здесь появятся статус доставки,
                  состав заказа и история оплат.
                </p>
              </div>
              <Link href="/catalog">Перейти в каталог</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
