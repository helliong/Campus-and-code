'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { generateSlug } from '@/lib/shared/utils';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getProductAvailableStock, getProductImagesForColor, hasVariantStock } from '@/lib/products/productVariants';
import './ProductCard.scss';

const categoryNames: Record<string, string> = {
  hoodie: 'Худи',
  tshirt: 'Футболки',
  sticker: 'Стикеры',
  accessories: 'Аксессуары',
  mug: 'Кружки',
  bags: 'Сумки',
  notebooks: 'Блокноты',
  gadgets: 'Гаджеты',
  other: 'Разное'
};

const colorHexMap: Record<string, string> = {
  black: "#1A1A1A",
  blue: "#1C2331",
  white: "#F5F5F5",
  gray: "#A9A9A9",
  beige: "#EADDD7",
  red: "#E63946",
  green: "#2A9D8F",
};

export default function ProductCard({ product }: { product: Product }) {
  const { items, addToCart, updateQuantity } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  const [isMounted, setIsMounted] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.availableSizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.availableColors?.[0]);

  // Fix hydration mismatch: wait until mounted to read from localStorage-backed contexts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const favorite = isMounted ? isFavorite(product.id) : false;
  const productImages = getProductImagesForColor(product, selectedColor);
  const cardImage = productImages[0] || product.imageUrl;
  const isSelectedVariantInStock = hasVariantStock(product, selectedColor, selectedSize);

  const cartItem = items.find(item => 
    item.product.id === product.id && 
    item.selectedSize === selectedSize && 
    item.selectedColor === selectedColor
  );
  const quantity = isMounted && cartItem ? cartItem.quantity : 0;
  const availableStock = getProductAvailableStock(product, selectedColor, selectedSize);
  const isAtStockLimit = quantity >= availableStock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSelectedVariantInStock) return;
    addToCart(product, 1, selectedSize, selectedColor);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSelectedVariantInStock) return;
    updateQuantity(product.id, quantity + 1, selectedSize, selectedColor);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    updateQuantity(product.id, quantity - 1, selectedSize, selectedColor);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (favorite) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const identifier = product.sku || product.id;
  const productUrl = `/product/${identifier}-${generateSlug(product.name)}`;

  return (
    <div className="product-card">
      <Link href={productUrl} className="image-wrapper">
        <Image 
          src={cardImage} 
          alt={product.name} 
          width={300} 
          height={300}
          className="product-image"
          unoptimized // for placeholder images
        />
        <button 
          className={`favorite-btn ${favorite ? 'active' : ''}`}
          onClick={handleFavoriteToggle}
          aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {favorite ? (
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            ) : (
              <path d="M12 21.35a1 1 0 0 1-.64-.23C5.2 15.98 2 12.74 2 8.75A5.73 5.73 0 0 1 7.75 3 6.27 6.27 0 0 1 12 4.75 6.27 6.27 0 0 1 16.25 3 5.73 5.73 0 0 1 22 8.75c0 3.99-3.2 7.23-9.36 12.37a1 1 0 0 1-.64.23ZM7.75 5A3.72 3.72 0 0 0 4 8.75c0 2.87 2.45 5.57 8 10.29 5.55-4.72 8-7.42 8-10.29A3.72 3.72 0 0 0 16.25 5a4.25 4.25 0 0 0-3.45 1.8 1 1 0 0 1-1.6 0A4.25 4.25 0 0 0 7.75 5Z" />
            )}
          </svg>
        </button>
      </Link>
      <div className="product-info">
        <p className="category-name">{categoryNames[product.category] || 'Товар'}</p>
        <h3><Link href={productUrl}>{product.name}</Link></h3>
        <p className="price">{product.price.toLocaleString('ru-RU')} ₽</p>

        {product.availableColors && product.availableColors.length > 0 && (
          <div className="color-selector">
            {product.availableColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-btn ${selectedColor === color ? "active" : ""}`}
                style={{ backgroundColor: colorHexMap[color] || "#111" }}
                onClick={(event) => {
                  event.preventDefault();
                  setSelectedColor(color);
                }}
                aria-label={`Выбрать цвет ${color}`}
              />
            ))}
          </div>
        )}
        
        {product.availableSizes && product.availableSizes.length > 0 ? (
          <div className="card-actions compact-mode">
            <div className="size-selector">
              {product.availableSizes.map(size => {
                const isSizeAvailable = hasVariantStock(product, selectedColor, size);

                return (
                  <button 
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    disabled={!isSizeAvailable}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedSize(size);
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {quantity > 0 ? (
              <div className="quantity-controls compact">
                <button className="qty-btn" onClick={handleDecrement}>-</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={handleIncrement} disabled={isAtStockLimit} aria-label={isAtStockLimit ? "Достигнут доступный остаток" : "Увеличить количество"}>+</button>
              </div>
            ) : (
              <button className="cart-icon-btn" onClick={handleAddToCart} aria-label="В корзину" disabled={!isSelectedVariantInStock}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="card-actions full-mode">
            {quantity > 0 ? (
              <div className="quantity-controls">
                <button className="qty-btn" onClick={handleDecrement}>-</button>
                <span className="qty-value">{quantity} шт.</span>
                <button className="qty-btn" onClick={handleIncrement} disabled={isAtStockLimit} aria-label={isAtStockLimit ? "Достигнут доступный остаток" : "Увеличить количество"}>+</button>
              </div>
            ) : (
              <button className="view-btn" onClick={handleAddToCart} disabled={!isSelectedVariantInStock}>
                <span>В корзину</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
