import assert from "node:assert/strict";
import test from "node:test";
import { Role } from "@prisma/client";
import { calculateOrderPrice, isDeliveryMethod } from "./orderPricing";

test("order price is calculated on the server with student and promo discounts", () => {
  assert.deepEqual(
    calculateOrderPrice({
      productsTotal: 2_000,
      role: Role.STUDENT,
      deliveryMethod: "courier",
      promoCode: "campus10",
    }),
    {
      productsTotal: 2_000,
      studentDiscount: 200,
      promoCode: "CAMPUS10",
      promoDiscount: 180,
      deliveryPrice: 290,
      total: 1_910,
    },
  );
});

test("unknown and unavailable promo codes do not affect the order", () => {
  const result = calculateOrderPrice({
    productsTotal: 500,
    role: Role.EXPLORER,
    deliveryMethod: "post",
    promoCode: "CAMPUS10",
  });
  assert.equal(result.promoDiscount, 0);
  assert.equal(result.promoCode, undefined);
  assert.equal(result.total, 890);
});

test("delivery methods are restricted to server-side options", () => {
  assert.equal(isDeliveryMethod("cdek"), true);
  assert.equal(isDeliveryMethod("free"), false);
});
