"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { CartItem, Product } from "@/types";
import { getSerializedCartItems, useCartStore } from "@/store/cartStore";
import { getProductAvailableStock } from "@/lib/products/productVariants";

type DbCartItem = {
  productId: string;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  product: Product;
};

function mapDbCartItems(cartItems: DbCartItem[], localItems: CartItem[]): CartItem[] {
  return cartItems.flatMap((dbItem) => {
    const localItem = localItems.find(
      (item) =>
        item.product.id === dbItem.productId &&
        item.selectedSize === (dbItem.selectedSize || undefined) &&
        item.selectedColor === (dbItem.selectedColor || undefined)
    );
    const quantity = Math.min(
      dbItem.quantity,
      getProductAvailableStock(dbItem.product, dbItem.selectedColor || undefined, dbItem.selectedSize || undefined),
    );
    if (quantity <= 0) return [];

    return [{
      product: dbItem.product,
      quantity,
      selectedSize: dbItem.selectedSize || undefined,
      selectedColor: dbItem.selectedColor || undefined,
      isSelected: localItem && localItem.isSelected !== undefined ? localItem.isSelected : true,
    }];
  });
}

function CartSync() {
  const { status } = useSession();
  const isInitialSyncDone = useRef(false);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      if (wasAuthenticated.current) {
        useCartStore.getState().resetCart();
      } else {
        useCartStore.getState().setDbSyncEnabled(false);
      }
      wasAuthenticated.current = false;
      isInitialSyncDone.current = false;
      return;
    }

    if (status !== "authenticated" || isInitialSyncDone.current) return;

    wasAuthenticated.current = true;
    isInitialSyncDone.current = true;
    let isCancelled = false;
    const currentItems = useCartStore.getState().items;

    const isAlreadySynced = useCartStore.getState().isDbSyncEnabled;

    fetch("/api/user/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: isAlreadySynced ? "get" : "merge",
        localCart: isAlreadySynced ? [] : getSerializedCartItems(currentItems),
      }),
    })
      .then((response) => response.json())
      .then((data: { cartItems?: DbCartItem[] }) => {
        if (isCancelled) return;
        if (data.cartItems) {
          useCartStore.getState().setItems(mapDbCartItems(data.cartItems, currentItems));
        }
        useCartStore.getState().setDbSyncEnabled(true);
      })
      .catch((error) => {
        if (isCancelled) return;
        console.error("Cart sync error", error);
        useCartStore.getState().setDbSyncEnabled(true);
      });

    return () => {
      isCancelled = true;
    };
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
