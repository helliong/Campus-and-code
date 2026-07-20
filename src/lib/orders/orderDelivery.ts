const deliverableOrderStatuses = new Set(["PAID", "PROCESSING", "SHIPPED"]);

export function isOrderDeliverable(status: string) {
  return deliverableOrderStatuses.has(status);
}
