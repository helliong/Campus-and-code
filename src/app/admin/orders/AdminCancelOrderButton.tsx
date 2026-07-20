"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function AdminCancelOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const cancelOrder = async () => {
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/cancel`, { method: "POST" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Не удалось отменить заказ");
      setIsOpen(false);
      router.refresh();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Не удалось отменить заказ");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button className="admin-cancel-order" type="button" onClick={() => setIsOpen(true)}>Отменить</button>
      {error && <small className="admin-order-error" role="alert">{error}</small>}
      <ConfirmDialog
        isOpen={isOpen}
        title="Отменить заказ магазином?"
        description={`Заказ №${orderNumber} будет отменён от имени магазина. Для оплаченного заказа будет оформлен полный возврат.`}
        confirmLabel="Отменить заказ"
        isLoading={isLoading}
        onClose={() => setIsOpen(false)}
        onConfirm={() => void cancelOrder()}
      />
    </>
  );
}
