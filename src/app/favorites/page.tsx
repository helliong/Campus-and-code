'use client';

import Link from 'next/link';
import { useFavorites } from '../../context/FavoritesContext';
import ProductCard from '../../components/ProductCard';
import './page.scss';

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <main className="favorites-page">
      <h1>Избранное</h1>
      
      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>В избранном пока ничего нет.</p>
          <Link href="/" className="btn-primary">Перейти в каталог</Link>
        </div>
      ) : (
        <div className="product-grid">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
