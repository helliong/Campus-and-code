"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { isOrderCancellable } from "@/lib/orders/orderCancellation";
import "./page.scss";

type OrderStatus = "processing" | "in_transit" | "delivered" | "cancelled";

interface OrderProduct {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  imageUrl: string;
  href: string | null;
}

interface OrderPreview {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  rawStatus: string;
  canCancel: boolean;
  totalPrice: number;
  deliveryAddress: string;
  deliveryDate: string;
  products: OrderProduct[];
}

type ApiOrder = {
  id: string;
  number: string;
  status: string;
  total: number;
  deliveryAddress: string;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    imageUrl: string;
    quantity: number;
    selectedSize?: string | null;
    selectedColor?: string | null;
    product?: { slug: string } | null;
  }[];
};

type OrderFilter = "all" | "active" | "delivered" | "cancelled";

const statusMeta: Record<
  OrderStatus,
  { label: string; className: string; step: number }
> = {
  processing: { label: "Собирается", className: "status-processing", step: 1 },
  in_transit: { label: "В пути", className: "status-in-transit", step: 2 },
  delivered: { label: "Доставлен", className: "status-delivered", step: 3 },
  cancelled: { label: "Отменен", className: "status-cancelled", step: 0 },
};

const formatPrice = (price: number) => `${price.toLocaleString("ru-RU")} ₽`;

function mapOrderStatus(status: string): OrderStatus {
  if (status === "SHIPPED") return "in_transit";
  if (status === "DELIVERED") return "delivered";
  if (["CANCELED", "PAYMENT_FAILED", "REFUNDED"].includes(status)) return "cancelled";
  return "processing";
}

export default function ProfileOrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderPreview[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<OrderFilter>("all");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderPreview | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchOrders = useCallback(() => {
    return fetch("/api/user/orders", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { orders?: ApiOrder[] }) => {
        setOrders((data.orders || []).map((order) => ({
          id: order.id,
          orderNumber: order.number,
          date: new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(order.createdAt)),
          status: mapOrderStatus(order.status),
          rawStatus: order.status,
          canCancel: isOrderCancellable(order.status),
          totalPrice: order.total,
          deliveryAddress: order.deliveryAddress,
          deliveryDate: order.status === "DELIVERED" ? "Доставлен" : "Ожидает обработки",
          products: order.items.map((item) => ({
            id: item.id,
            name: item.productName,
            variant: [item.selectedColor, item.selectedSize].filter(Boolean).join(", ") || "Без варианта",
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            href: item.product ? `/product/${item.product.slug}` : null,
          })),
        })));
      })
      .catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    void fetchOrders();
  }, [status, fetchOrders]);

  const orderTabs: { label: string; filter: OrderFilter; value: number }[] = [
    { label: "Все", filter: "all", value: orders.length },
    { label: "Активные", filter: "active", value: orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length },
    { label: "Доставленные", filter: "delivered", value: orders.filter((order) => order.status === "delivered").length },
    { label: "Отмененные", filter: "cancelled", value: orders.filter((order) => order.status === "cancelled").length },
  ];

  const totalSpent = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.totalPrice, 0);
  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === "active") return !["delivered", "cancelled"].includes(order.status);
    if (selectedFilter === "delivered") return order.status === "delivered";
    if (selectedFilter === "cancelled") return order.status === "cancelled";
    return true;
  });

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    setActionError("");
    setCancellingOrderId(orderToCancel.id);
    try {
      const response = await fetch(`/api/user/orders/${orderToCancel.id}/cancel`, { method: "POST" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Не удалось отменить заказ");
      await fetchOrders();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Не удалось отменить заказ");
    } finally {
      setCancellingOrderId(null);
      setOrderToCancel(null);
    }
  };

  return (
    <>
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
            {orderTabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                className={`orders-tab ${selectedFilter === tab.filter ? "active" : ""}`}
                aria-selected={selectedFilter === tab.filter}
                onClick={() => setSelectedFilter(tab.filter)}
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

        {actionError && <p className="orders-action-error" role="alert">{actionError}</p>}

        <div className="orders-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
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
                  {order.products.map((product) => {
                    const productContent = <>
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
                    </>;

                    return product.href ? (
                      <Link className="order-product product-link" href={product.href} key={product.id}>
                        {productContent}
                      </Link>
                    ) : (
                      <div className="order-product" key={product.id}>{productContent}</div>
                    );
                  })}
                </div>

                <div className="order-card-footer">
                  <div className="delivery-info">
                    <span>{order.deliveryDate}</span>
                    <p>{order.deliveryAddress}</p>
                  </div>
                  <div className="order-actions">
                    <strong>{formatPrice(order.totalPrice)}</strong>
                    <Link href={`/profile/orders/${order.id}`}>Подробнее</Link>
                    {order.canCancel && (
                      <button
                        type="button"
                        className="cancel-order-button"
                        disabled={cancellingOrderId === order.id}
                        onClick={() => setOrderToCancel(order)}
                      >
                        {cancellingOrderId === order.id ? "Отмена…" : "Отменить"}
                      </button>
                    )}
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
                <h3>{orders.length === 0 ? "У вас пока нет заказов" : "В этой категории заказов нет"}</h3>
                <p>
                  {orders.length === 0
                    ? "После оформления покупки здесь появятся статус доставки, состав заказа и история оплат."
                    : "Выберите другую категорию, чтобы посмотреть остальные заказы."}
                </p>
              </div>
              <Link href="/catalog">Перейти в каталог</Link>
            </div>
          )}
        </div>
      </section>
    </div>
    <ConfirmDialog
      isOpen={Boolean(orderToCancel)}
      title="Отменить заказ?"
      description={`Заказ №${orderToCancel?.orderNumber || ""} будет отменён. Если он уже оплачен, мы оформим полный возврат через ЮKassa.`}
      confirmLabel="Да, отменить"
      isLoading={Boolean(cancellingOrderId)}
      onClose={() => setOrderToCancel(null)}
      onConfirm={() => void handleCancelOrder()}
    />
    </>
  );
}
