'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { CartItem, Product } from '../types';
import { useSession } from 'next-auth/react';
import { mockProducts } from '../lib/mockData';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const isInitialSyncDone = useRef(false);

  useEffect(() => {
    if (status === 'authenticated' && !isInitialSyncDone.current) {
      isInitialSyncDone.current = true;
      fetch('/api/user/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'merge', 
          localCart: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          })) 
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.cartItems) {
          const mergedCart: CartItem[] = data.cartItems.map((dbItem: any) => {
            const product = mockProducts.find(p => p.id === dbItem.productId);
            if (!product) return null;
            return {
              product,
              quantity: dbItem.quantity,
              selectedSize: dbItem.selectedSize,
              selectedColor: dbItem.selectedColor
            };
          }).filter(Boolean);
          setItems(mergedCart);
        }
      });
    }
  }, [status, items]);

  const syncToDb = (newCart: CartItem[]) => {
    if (status === 'authenticated') {
      fetch('/api/user/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'save', 
          localCart: newCart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          }))
        })
      }).catch(err => console.error("Sync error", err));
    }
  };

  const addToCart = (product: Product, quantity: number, size?: string, color?: string) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      let newItems;
      if (existingItemIndex > -1) {
        newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        newItems = [...prevItems, { product, quantity, selectedSize: size, selectedColor: color }];
      }
      syncToDb(newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => {
      const next = prevItems.filter((item) => item.product.id !== productId);
      syncToDb(next);
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    syncToDb([]);
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    setItems((prevItems) => {
      let next;
      if (quantity <= 0) {
        next = prevItems.filter(item => 
          !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
        );
      } else {
        next = prevItems.map(item => 
          (item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
            ? { ...item, quantity } 
            : item
        );
      }
      syncToDb(next);
      return next;
    });
  };

  const cartTotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
