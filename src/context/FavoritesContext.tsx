'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Product } from '../types';
import { useSession } from 'next-auth/react';
import { mockProducts } from '../lib/mockData';

interface FavoritesContextType {
  favorites: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { status } = useSession();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const isInitialSyncDone = useRef(false);

  useEffect(() => {
    if (status === 'authenticated' && !isInitialSyncDone.current) {
      isInitialSyncDone.current = true;
      fetch('/api/user/favorites/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'merge', localFavorites: favorites.map(p => p.id) })
      })
      .then(res => res.json())
      .then(data => {
        if (data.favorites) {
          const mergedProducts = data.favorites
            .map((id: string) => mockProducts.find(p => p.id === id))
            .filter(Boolean) as Product[];
          setFavorites(mergedProducts);
        }
      });
    }
  }, [status, favorites]);

  const syncToDb = (newFavorites: Product[]) => {
    if (status === 'authenticated') {
      fetch('/api/user/favorites/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', localFavorites: newFavorites.map(p => p.id) })
      }).catch(err => console.error("Sync error", err));
    }
  };

  const addFavorite = (product: Product) => {
    setFavorites((prev) => {
      if (!prev.find((p) => p.id === product.id)) {
        const next = [...prev, product];
        syncToDb(next);
        return next;
      }
      return prev;
    });
  };

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      syncToDb(next);
      return next;
    });
  };

  const isFavorite = (productId: string) => {
    return favorites.some((p) => p.id === productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
