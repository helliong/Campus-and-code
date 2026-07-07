'use client';
import { ReactNode } from 'react';
import { CartProvider } from './CartContext';
import { ThemeProvider } from './ThemeContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}
