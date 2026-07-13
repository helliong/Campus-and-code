"use client";

import { create } from "zustand";
import { CartItem, Product } from "@/types";

type CartSyncItem = {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};

type CartState = {
  items: CartItem[];
  cartTotal: number;
  isDbSyncEnabled: boolean;
  setItems: (items: CartItem[]) => void;
  setDbSyncEnabled: (isEnabled: boolean) => void;
  addToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
};

function getCartTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
}

function serializeCart(items: CartItem[]): CartSyncItem[] {
  return items.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    selectedSize: item.selectedSize,
    selectedColor: item.selectedColor,
  }));
}

function syncCartToDb(items: CartItem[]) {
  fetch("/api/user/cart/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "save",
      localCart: serializeCart(items),
    }),
  }).catch((error) => console.error("Sync error", error));
}

function buildCartState(items: CartItem[]) {
  return {
    items,
    cartTotal: getCartTotal(items),
  };
}

export const useCartStore = create<CartState>((set, get) => ({
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
    const currentItems = get().items;
    const existingItemIndex = currentItems.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color,
    );

    const nextItems =
      existingItemIndex > -1
        ? currentItems.map((item, index) =>
            index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item,
          )
        : [...currentItems, { product, quantity, selectedSize: size, selectedColor: color }];

    set(buildCartState(nextItems));
    if (get().isDbSyncEnabled) syncCartToDb(nextItems);
  },

  removeFromCart: (productId) => {
    const nextItems = get().items.filter((item) => item.product.id !== productId);
    set(buildCartState(nextItems));
    if (get().isDbSyncEnabled) syncCartToDb(nextItems);
  },

  updateQuantity: (productId, quantity, size, color) => {
    const nextItems =
      quantity <= 0
        ? get().items.filter(
            (item) => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color),
          )
        : get().items.map((item) =>
            item.product.id === productId && item.selectedSize === size && item.selectedColor === color
              ? { ...item, quantity }
              : item,
          );

    set(buildCartState(nextItems));
    if (get().isDbSyncEnabled) syncCartToDb(nextItems);
  },

  clearCart: () => {
    set(buildCartState([]));
    if (get().isDbSyncEnabled) syncCartToDb([]);
  },
}));

export function getSerializedCartItems(items: CartItem[]) {
  return serializeCart(items);
}
