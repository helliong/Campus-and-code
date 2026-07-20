import assert from "node:assert/strict";
import test from "node:test";
import {
  filterValidCartItems,
  isSameCartVariant,
  limitCartItemsToStock,
  mergeCartItems,
} from "./cartSync";

test("api cart sync filters local items by existing product ids", () => {
  const localCart = [
    { productId: "valid", quantity: 1 },
    { productId: "missing", quantity: 2 },
  ];

  assert.deepEqual(filterValidCartItems(localCart, new Set(["valid"])), [
    { productId: "valid", quantity: 1 },
  ]);
});

test("api cart sync compares product variants with null and undefined as empty values", () => {
  assert.equal(
    isSameCartVariant(
      { productId: "product", quantity: 1, selectedSize: null },
      { productId: "product", quantity: 1, selectedSize: undefined },
    ),
    true,
  );

  assert.equal(
    isSameCartVariant(
      { productId: "product", quantity: 1, selectedSize: "M" },
      { productId: "product", quantity: 1, selectedSize: "L" },
    ),
    false,
  );
});

test("api cart sync merges matching variants and appends new valid variants", () => {
  const merged = mergeCartItems(
    [
      {
        id: "db-item",
        userId: "user",
        productId: "hoodie",
        quantity: 2,
        selectedSize: "M",
        selectedColor: "black",
      },
    ],
    [
      {
        productId: "hoodie",
        quantity: 3,
        selectedSize: "M",
        selectedColor: "black",
      },
      {
        productId: "hoodie",
        quantity: 1,
        selectedSize: "L",
        selectedColor: "black",
      },
      {
        productId: "missing",
        quantity: 99,
      },
    ],
    new Set(["hoodie"]),
    "user",
  );

  assert.deepEqual(merged, [
    {
      id: "db-item",
      userId: "user",
      productId: "hoodie",
      quantity: 5,
      selectedSize: "M",
      selectedColor: "black",
    },
    {
      id: "new",
      userId: "user",
      productId: "hoodie",
      quantity: 1,
      selectedSize: "L",
      selectedColor: "black",
    },
  ]);
});

test("api cart sync limits quantities to real product and variant stock", () => {
  const limited = limitCartItemsToStock(
    [
      { productId: "plain", quantity: 3 },
      { productId: "hoodie", quantity: 2, selectedColor: "black", selectedSize: "M" },
      { productId: "hoodie", quantity: 1, selectedColor: "black", selectedSize: "L" },
    ],
    [
      { id: "plain", stockCount: 1, inStock: true, variants: [] },
      { id: "hoodie", stockCount: 5, inStock: true, variants: [{ color: "black", size: "M", stock: 1 }] },
    ],
  );

  assert.deepEqual(limited, [
    { productId: "plain", quantity: 1 },
    { productId: "hoodie", quantity: 1, selectedColor: "black", selectedSize: "M" },
  ]);
});
