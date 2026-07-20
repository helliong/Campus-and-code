import assert from "node:assert/strict";
import test from "node:test";
import { isOrderDeliverable } from "./orderDelivery";

test("paid and active delivery orders can be marked as delivered", () => {
  for (const status of ["PAID", "PROCESSING", "SHIPPED"]) {
    assert.equal(isOrderDeliverable(status), true);
  }
});

test("unpaid and terminal orders cannot be marked as delivered", () => {
  for (const status of ["AWAITING_PAYMENT", "PAYMENT_FAILED", "DELIVERED", "CANCELED", "REFUNDED"]) {
    assert.equal(isOrderDeliverable(status), false);
  }
});
