import assert from "node:assert/strict";
import test from "node:test";
import { formatYooKassaAmount } from "./yookassa";

test("YooKassa amount uses two decimal places", () => {
  assert.equal(formatYooKassaAmount(1), "1.00");
  assert.equal(formatYooKassaAmount(1_999), "1999.00");
});
