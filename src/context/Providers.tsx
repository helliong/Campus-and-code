'use client';
import { ReactNode } from 'react';
import { CartProvider } from './CartContext';
import { ThemeProvider } from './ThemeContext';
import { FavoritesProvider } from './FavoritesContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <CartProvider>{children}</CartProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
