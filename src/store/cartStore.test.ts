import assert from "node:assert/strict";
import test from "node:test";
import { CartItem, Product } from "@/types";
import { getCartTotal, getResetCartState, getSerializedCartItems } from "./cartStore";

function product(id: string, price: number): Product {
  return {
    id,
    price,
    name: `Product ${id}`,
    description: "",
    imageUrl: "/test.webp",
    category: "tshirt",
  };
}

test("cart total includes selected items and items without explicit selection", () => {
  const items: CartItem[] = [
    { product: product("first", 100), quantity: 2 },
    { product: product("second", 300), quantity: 1, isSelected: true },
    { product: product("third", 500), quantity: 1, isSelected: false },
  ];

  assert.equal(getCartTotal(items), 500);
});

test("cart serialization keeps product id, quantity and selected variant", () => {
  const items: CartItem[] = [
    {
      product: product("hoodie", 1200),
      quantity: 3,
      selectedSize: "M",
      selectedColor: "black",
      isSelected: false,
    },
  ];

  assert.deepEqual(getSerializedCartItems(items), [
    {
      productId: "hoodie",
      quantity: 3,
      selectedSize: "M",
      selectedColor: "black",
    },
  ]);
});

test("cart reset removes persisted user items without database sync", () => {
  assert.deepEqual(getResetCartState(), {
    items: [],
    cartTotal: 0,
    isDbSyncEnabled: false,
  });
});
