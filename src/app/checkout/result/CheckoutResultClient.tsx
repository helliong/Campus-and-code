"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";

type OrderResult = {
  number: string;
  status: string;
  total: number;
  payments: { status: string; test: boolean; cancellationReason?: string | null }[];
};

export default function CheckoutResultClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Не указан идентификатор заказа");
      return;
    }

    let active = true;
    let attempts = 0;
    const loadOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { cache: "no-store" });
        const data = await response.json() as OrderResult & { error?: string };
        if (!response.ok) throw new Error(data.error || "Не удалось получить заказ");
        if (!active) return;
        setOrder(data);
        if (data.status === "PAID") {
          useCartStore.getState().clearCart();
          return;
        }
        if (["PAYMENT_FAILED", "CANCELED"].includes(data.status)) return;
        attempts += 1;
        if (attempts < 12) window.setTimeout(loadOrder, 2500);
      } catch (requestError) {
        if (active) setError(requestError instanceof Error ? requestError.message : "Ошибка проверки заказа");
      }
    };

    loadOrder();
    return () => { active = false; };
  }, [orderId]);

  const isPaid = order?.status === "PAID";
  const isFailed = order && ["PAYMENT_FAILED", "CANCELED"].includes(order.status);
  const Icon = isPaid ? FiCheckCircle : isFailed ? FiXCircle : FiClock;

  return (
    <main className="checkout-result-page">
      <section className={`checkout-result-card ${isPaid ? "success" : isFailed ? "failed" : "pending"}`}>
        <Icon aria-hidden="true" />
        {error ? (
          <><h1>Не удалось проверить оплату</h1><p>{error}</p></>
        ) : !order ? (
          <><h1>Проверяем оплату</h1><p>Подождите, пока ЮKassa подтвердит результат платежа.</p></>
        ) : isPaid ? (
          <><h1>Заказ оплачен</h1><p>Заказ №{order.number} создан и появился в личном кабинете.</p></>
        ) : isFailed ? (
          <><h1>Оплата не прошла</h1><p>Заказ №{order.number} сохранён, но платёж был отменён.</p></>
        ) : (
          <><h1>Ожидаем подтверждение</h1><p>Заказ №{order.number} ожидает ответ от ЮKassa.</p></>
        )}
        {order?.payments[0]?.test && <span className="test-badge">Тестовый платёж</span>}
        <div className="result-actions">
          <Link href="/profile/orders">Мои заказы</Link>
          <Link href="/catalog" className="secondary">В каталог</Link>
        </div>
      </section>
    </main>
  );
}
