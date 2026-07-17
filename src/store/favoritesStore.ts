"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

type FavoritesState = {
  favorites: Product[];
  isDbSyncEnabled: boolean;
  setFavorites: (favorites: Product[]) => void;
  setDbSyncEnabled: (isEnabled: boolean) => void;
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
};

function syncFavoritesToDb(favorites: Product[]) {
  fetch("/api/user/favorites/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "save",
      localFavorites: favorites.map((product) => product.id),
    }),
  }).catch((error) => console.error("Sync error", error));
}

export function getFavoriteProductIds(favorites: Product[]) {
  return favorites.map((product) => product.id);
}

export function isProductFavorite(favorites: Product[], productId: string) {
  return favorites.some((product) => product.id === productId);
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
  isDbSyncEnabled: false,

  setFavorites: (favorites) => {
    set({ favorites });
  },

  setDbSyncEnabled: (isEnabled) => {
    set({ isDbSyncEnabled: isEnabled });
  },

  addFavorite: (product) => {
    const currentFavorites = get().favorites;
    if (currentFavorites.some((favorite) => favorite.id === product.id)) return;

    const nextFavorites = [...currentFavorites, product];
    set({ favorites: nextFavorites });
    if (get().isDbSyncEnabled) syncFavoritesToDb(nextFavorites);
  },

  removeFavorite: (productId) => {
    const nextFavorites = get().favorites.filter((product) => product.id !== productId);
    set({ favorites: nextFavorites });
    if (get().isDbSyncEnabled) syncFavoritesToDb(nextFavorites);
  },

  isFavorite: (productId) => {
    return isProductFavorite(get().favorites, productId);
  },
}), { name: "favorites-storage" }));
