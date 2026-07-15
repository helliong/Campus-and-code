"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Product } from "@/types";
import { useFavoritesStore } from "@/store/favoritesStore";

function FavoritesSync() {
  const { status } = useSession();
  const isInitialSyncDone = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      useFavoritesStore.getState().setDbSyncEnabled(false);
      isInitialSyncDone.current = false;
      return;
    }

    if (status !== "authenticated" || isInitialSyncDone.current) return;

    isInitialSyncDone.current = true;
    const currentFavorites = useFavoritesStore.getState().favorites;

    fetch("/api/user/favorites/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "merge",
        localFavorites: currentFavorites.map((product) => product.id),
      }),
    })
      .then((response) => response.json())
      .then((data: { favorites?: Product[] }) => {
        if (data.favorites) {
          useFavoritesStore.getState().setFavorites(data.favorites);
        }
        useFavoritesStore.getState().setDbSyncEnabled(true);
      })
      .catch((error) => {
        console.error("Favorites sync error", error);
        useFavoritesStore.getState().setDbSyncEnabled(true);
      });
  }, [status]);

  return null;
}

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <FavoritesSync />
      {children}
    </>
  );
};

export const useFavorites = useFavoritesStore;
