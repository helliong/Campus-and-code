"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function CancelOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const cancelOrder = async () => {
    setError("");
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/user/orders/${orderId}/cancel`, { method: "POST" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Не удалось отменить заказ");
      setIsDialogOpen(false);
      router.refresh();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Не удалось отменить заказ");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="cancel-order-action">
        <button type="button" disabled={isCancelling} onClick={() => setIsDialogOpen(true)}>Отменить заказ</button>
        {error && <small role="alert">{error}</small>}
      </div>
      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Отменить заказ?"
        description={`Заказ №${orderNumber} будет отменён. Если он уже оплачен, мы оформим полный возврат через ЮKassa.`}
        confirmLabel="Да, отменить"
        isLoading={isCancelling}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() => void cancelOrder()}
      />
    </>
  );
}
