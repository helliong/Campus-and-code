"use client";

import { useState } from "react";

export default function PayOrderButton({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const openPayment = async () => {
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/orders/${orderId}/pay`, { method: "POST" });
      const data = await response.json() as { error?: string; confirmationUrl?: string };
      if (!response.ok || !data.confirmationUrl) {
        throw new Error(data.error || "Не удалось открыть страницу оплаты");
      }
      window.location.assign(data.confirmationUrl);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Не удалось открыть страницу оплаты");
      setIsLoading(false);
    }
  };

  return (
    <div className="pay-order-action">
      <button type="button" disabled={isLoading} onClick={() => void openPayment()}>
        {isLoading ? "Открываем…" : "Оплатить заказ"}
      </button>
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
