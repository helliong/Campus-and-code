"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function AdminDeliverOrderButton({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const deliverOrder = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/deliver`, {
        method: "POST",
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Не удалось отметить заказ доставленным");
      }

      setIsOpen(false);
      router.refresh();
    } catch (deliveryError) {
      setError(
        deliveryError instanceof Error
          ? deliveryError.message
          : "Не удалось отметить заказ доставленным",
      );
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className="admin-deliver-order"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Доставить
      </button>
      {error && <small className="admin-order-error" role="alert">{error}</small>}
      <ConfirmDialog
        isOpen={isOpen}
        title="Отметить заказ доставленным?"
        description={`Заказ №${orderNumber} получит статус «Доставлен».`}
        confirmLabel="Доставить"
        cancelLabel="Не менять"
        loadingLabel="Обновляем…"
        variant="success"
        isLoading={isLoading}
        onClose={() => setIsOpen(false)}
        onConfirm={() => void deliverOrder()}
      />
    </>
  );
}
