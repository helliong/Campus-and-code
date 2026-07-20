import assert from "node:assert/strict";
import test from "node:test";
import { Product } from "@/types";
import { getFavoriteProductIds, getResetFavoritesState, isProductFavorite } from "./favoritesStore";

function product(id: string): Product {
  return {
    id,
    price: 100,
    name: `Product ${id}`,
    description: "",
    imageUrl: "/test.webp",
    category: "tshirt",
  };
}

test("favorite ids preserve the current favorites order", () => {
  assert.deepEqual(getFavoriteProductIds([product("one"), product("two")]), [
    "one",
    "two",
  ]);
});

test("favorite lookup returns true only for existing products", () => {
  const favorites = [product("one"), product("two")];

  assert.equal(isProductFavorite(favorites, "two"), true);
  assert.equal(isProductFavorite(favorites, "missing"), false);
});

test("favorites reset removes persisted user products without database sync", () => {
  assert.deepEqual(getResetFavoritesState(), {
    favorites: [],
    isDbSyncEnabled: false,
  });
});
