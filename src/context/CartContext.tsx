"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { CartItem } from "@/types";
import { mockProducts } from "@/lib/mockData";
import { getSerializedCartItems, useCartStore } from "@/store/cartStore";

type DbCartItem = {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};

function mapDbCartItems(cartItems: DbCartItem[]): CartItem[] {
  return cartItems.reduce<CartItem[]>((mappedItems, dbItem) => {
    const product = mockProducts.find((item) => item.id === dbItem.productId);
    if (!product) return mappedItems;

    mappedItems.push({
      product,
      quantity: dbItem.quantity,
      selectedSize: dbItem.selectedSize,
      selectedColor: dbItem.selectedColor,
    });

    return mappedItems;
  }, []);
}

function CartSync() {
  const { status } = useSession();
  const isInitialSyncDone = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      useCartStore.getState().setDbSyncEnabled(false);
      isInitialSyncDone.current = false;
      return;
    }

    if (status !== "authenticated" || isInitialSyncDone.current) return;

    isInitialSyncDone.current = true;
    const currentItems = useCartStore.getState().items;

    fetch("/api/user/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "merge",
        localCart: getSerializedCartItems(currentItems),
      }),
    })
      .then((response) => response.json())
      .then((data: { cartItems?: DbCartItem[] }) => {
        if (data.cartItems) {
          useCartStore.getState().setItems(mapDbCartItems(data.cartItems));
        }
        useCartStore.getState().setDbSyncEnabled(true);
      })
      .catch((error) => {
        console.error("Cart sync error", error);
        useCartStore.getState().setDbSyncEnabled(true);
      });
  }, [status]);

  return null;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <CartSync />
      {children}
    </>
  );
};

export const useCart = useCartStore;
