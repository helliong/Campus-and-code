const cancellableOrderStatuses = new Set([
  "AWAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
]);

export function isOrderCancellable(status: string) {
  return cancellableOrderStatuses.has(status);
}
