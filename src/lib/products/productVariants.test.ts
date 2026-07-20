import assert from "node:assert/strict";
import test from "node:test";
import type { Product } from "@/types";
import {
  getProductAvailableStock,
  getAvailableSizesForColor,
  getProductImagesForColor,
  getVariantStock,
  hasVariantStock,
  variantKey,
} from "./productVariants";

const product: Product = {
  id: "product-1",
  name: "Худи",
  description: "",
  price: 3000,
  imageUrl: "/fallback.webp",
  images: ["/main.webp"],
  imagesByColor: { black: ["/black-1.webp", "/black-2.webp"] },
  category: "hoodie",
  availableSizes: ["S", "M", "L"],
  availableColors: ["black", "white"],
  inStock: true,
  variants: [
    { color: "black", size: "S", stock: 2 },
    { color: "black", size: "M", stock: 0 },
    { color: "black", size: "L", stock: 1 },
  ],
};

test("variantKey creates a stable key for missing and selected options", () => {
  assert.equal(variantKey("black", "M"), "black::M");
  assert.equal(variantKey(), "none::none");
});

test("product images prefer selected color and fall back to general images", () => {
  assert.deepEqual(getProductImagesForColor(product, "black"), ["/black-1.webp", "/black-2.webp"]);
  assert.deepEqual(getProductImagesForColor(product, "white"), ["/main.webp"]);
  assert.deepEqual(getProductImagesForColor({ ...product, images: [] }, "white"), ["/fallback.webp"]);
});

test("variant stock and availability use exact color and size combination", () => {
  assert.equal(getVariantStock(product.variants, "black", "S"), 2);
  assert.equal(getVariantStock(product.variants, "white", "S"), undefined);
  assert.equal(hasVariantStock(product, "black", "M"), false);
  assert.equal(hasVariantStock(product, "black", "L"), true);
  assert.equal(hasVariantStock({ ...product, variants: undefined, inStock: false }), false);
});

test("available stock uses the selected variant and product fallback", () => {
  assert.equal(getProductAvailableStock(product, "black", "S"), 2);
  assert.equal(getProductAvailableStock(product, "black", "M"), 0);
  assert.equal(getProductAvailableStock(product, "white", "S"), 0);
  assert.equal(getProductAvailableStock({ ...product, variants: undefined, stockCount: 1 }), 1);
});

test("available sizes exclude variants with zero stock", () => {
  assert.deepEqual(getAvailableSizesForColor(product, "black"), ["S", "L"]);
  assert.deepEqual(
    getAvailableSizesForColor({ ...product, variants: undefined }, "black"),
    ["S", "M", "L"],
  );
});
