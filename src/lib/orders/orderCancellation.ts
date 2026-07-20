const cancellableOrderStatuses = new Set([
  "AWAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
]);

const payableOrderStatuses = new Set(["AWAITING_PAYMENT", "PAYMENT_FAILED"]);

export function isOrderCancellable(status: string) {
  return cancellableOrderStatuses.has(status);
}

export function isOrderPayable(status: string) {
  return payableOrderStatuses.has(status);
}
