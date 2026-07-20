"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";
import { getProductAvailableStock } from "@/lib/products/productVariants";

type CartSyncItem = {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};

type SyncedCartItem = CartSyncItem & { product: Product };

type CartState = {
  items: CartItem[];
  cartTotal: number;
  isDbSyncEnabled: boolean;
  setItems: (items: CartItem[]) => void;
  setDbSyncEnabled: (isEnabled: boolean) => void;
  addToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  toggleItemSelection: (productId: string, size?: string, color?: string) => void;
  toggleAllSelection: (isSelected: boolean) => void;
  clearCart: () => void;
  resetCart: () => void;
};

export function getCartTotal(items: CartItem[]) {
  return items
    .filter((item) => item.isSelected !== false)
    .reduce((total, item) => total + item.product.price * item.quantity, 0);
}

function serializeCart(items: CartItem[]): CartSyncItem[] {
  return items.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    selectedSize: item.selectedSize,
    selectedColor: item.selectedColor,
  }));
}

let latestCartSyncRequest = 0;

function syncCartToDb(items: CartItem[]) {
  const requestId = ++latestCartSyncRequest;
  fetch("/api/user/cart/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "save",
      localCart: serializeCart(items),
    }),
  })
    .then(async (response) => {
      if (!response.ok) return;
      const data = await response.json() as { cartItems?: SyncedCartItem[] };
      if (!data.cartItems || requestId !== latestCartSyncRequest) return;
      const currentItems = useCartStore.getState().items;
      const syncedItems = data.cartItems.map((dbItem) => {
        const currentItem = currentItems.find(
          (item) =>
            item.product.id === dbItem.productId
            && item.selectedSize === (dbItem.selectedSize || undefined)
            && item.selectedColor === (dbItem.selectedColor || undefined),
        );
        return {
          product: dbItem.product,
          quantity: dbItem.quantity,
          selectedSize: dbItem.selectedSize || undefined,
          selectedColor: dbItem.selectedColor || undefined,
          isSelected: currentItem?.isSelected ?? true,
        };
      });
      useCartStore.setState(buildCartState(syncedItems));
    })
    .catch((error) => console.error("Sync error", error));
}

function buildCartState(items: CartItem[]) {
  return {
    items,
    cartTotal: getCartTotal(items),
  };
}

export function getResetCartState() {
  return { ...buildCartState([]), isDbSyncEnabled: false };
}

import { useFavoritesStore } from "./favoritesStore";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
  cartTotal: 0,
  isDbSyncEnabled: false,

  setItems: (items) => {
    set(buildCartState(items));
  },

  setDbSyncEnabled: (isEnabled) => {
    set({ isDbSyncEnabled: isEnabled });
  },

  addToCart: (product, quantity, size, color) => {
    // Automatically remove from favorites when adding to cart
    useFavoritesStore.getState().removeFavorite(product.id);

    const currentItems = get().items;
    const existingItemIndex = currentItems.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color,
    );
    const availableStock = getProductAvailableStock(product, color, size);
    const currentQuantity = existingItemIndex > -1 ? currentItems[existingItemIndex].quantity : 0;
    const nextQuantity = Math.min(currentQuantity + Math.max(0, quantity), availableStock);
    if (nextQuantity <= currentQuantity) return;

    const nextItems =
      existingItemIndex > -1
        ? currentItems.map((item, index) =>
            index === existingItemIndex ? { ...item, quantity: nextQuantity } : item,
          )
        : [...currentItems, { product, quantity: nextQuantity, selectedSize: size, selectedColor: color, isSelected: true }];

    set(buildCartState(nextItems));
    if (get().isDbSyncEnabled) syncCartToDb(nextItems);
  },

  removeFromCart: (productId) => {
    const nextItems = get().items.filter((item) => item.product.id !== productId);
    set(buildCartState(nextItems));
    if (get().isDbSyncEnabled) syncCartToDb(nextItems);
  },

  updateQuantity: (productId, quantity, size, color) => {
    const currentItem = get().items.find(
      (item) => item.product.id === productId && item.selectedSize === size && item.selectedColor === color,
    );
    const limitedQuantity = currentItem
      ? Math.min(quantity, getProductAvailableStock(currentItem.product, color, size))
      : quantity;
    const nextItems =
      limitedQuantity <= 0
        ? get().items.filter(
            (item) => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color),
          )
        : get().items.map((item) =>
            item.product.id === productId && item.selectedSize === size && item.selectedColor === color
              ? { ...item, quantity: limitedQuantity }
              : item,
          );

    set(buildCartState(nextItems));
    if (get().isDbSyncEnabled) syncCartToDb(nextItems);
  },

  toggleItemSelection: (productId, size, color) => {
    const nextItems = get().items.map((item) =>
      item.product.id === productId && item.selectedSize === size && item.selectedColor === color
        ? { ...item, isSelected: item.isSelected === false ? true : false }
        : item
    );
    set(buildCartState(nextItems));
  },

  toggleAllSelection: (isSelected) => {
    const nextItems = get().items.map((item) => ({ ...item, isSelected }));
    set(buildCartState(nextItems));
  },

  clearCart: () => {
    set(buildCartState([]));
    if (get().isDbSyncEnabled) syncCartToDb([]);
  },

  resetCart: () => {
    set(getResetCartState());
  },
}), { name: "cart-storage" }));

export function getSerializedCartItems(items: CartItem[]) {
  return serializeCart(items);
}
