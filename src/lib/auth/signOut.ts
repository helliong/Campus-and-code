"use client";

import { signOut } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";

export function clearClientUserState() {
  useCartStore.getState().resetCart();
  useFavoritesStore.getState().clearFavorites();
}

export async function signOutAndClearUserState(callbackUrl = "/") {
  clearClientUserState();
  await signOut({ callbackUrl });
}
