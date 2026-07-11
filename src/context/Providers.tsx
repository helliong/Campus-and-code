'use client';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from './CartContext';
import { ThemeProvider } from './ThemeContext';
import { FavoritesProvider } from './FavoritesContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <CartProvider>{children}</CartProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
