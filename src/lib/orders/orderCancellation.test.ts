import assert from "node:assert/strict";
import test from "node:test";
import { isOrderCancellable } from "./orderCancellation";

test("an order can be cancelled before delivery", () => {
  for (const status of ["AWAITING_PAYMENT", "PAID", "PROCESSING", "SHIPPED"]) {
    assert.equal(isOrderCancellable(status), true);
  }
});

test("terminal order statuses cannot be cancelled", () => {
  for (const status of ["DELIVERED", "CANCELED", "PAYMENT_FAILED", "REFUNDED"]) {
    assert.equal(isOrderCancellable(status), false);
  }
});
