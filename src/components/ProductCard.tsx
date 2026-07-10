'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import './ProductCard.scss';

export default function ProductCard({ product }: { product: Product }) {
  const { items, addToCart, updateQuantity } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(product.id);

  const defaultSize = product.availableSizes?.[0];
  const defaultColor = product.availableColors?.[0];

  const cartItem = items.find(item => 
    item.product.id === product.id && 
    item.selectedSize === defaultSize && 
    item.selectedColor === defaultColor
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1, defaultSize, defaultColor);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    updateQuantity(product.id, quantity + 1, defaultSize, defaultColor);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    updateQuantity(product.id, quantity - 1, defaultSize, defaultColor);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (favorite) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`} className="image-wrapper">
        <Image 
          src={product.imageUrl} 
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
        <h3><Link href={`/product/${product.id}`}>{product.name}</Link></h3>
        <p className="price">{product.price.toLocaleString('ru-RU')} ₽</p>
        
        {quantity > 0 ? (
          <div className="quantity-controls">
            <button className="qty-btn" onClick={handleDecrement}>-</button>
            <span className="qty-value">{quantity} шт.</span>
            <button className="qty-btn" onClick={handleIncrement}>+</button>
          </div>
        ) : (
          <button className="view-btn" onClick={handleAddToCart}>В корзину</button>
        )}
      </div>
    </div>
  );
}
