import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';
import { mockProducts } from '../../../lib/mockData';
import { notFound } from 'next/navigation';
import './page.scss';
// We would usually import a Client Component here for Add To Cart button
import AddToCartButton from './AddToCartButton';

const categoryNames: Record<string, string> = {
  hoodie: 'Худи',
  tshirt: 'Футболки',
  sticker: 'Стикеры',
  accessories: 'Аксессуары',
  mug: 'Кружки',
  other: 'Разное'
};

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const actualId = resolvedParams.id.split('-')[0];
  const product = mockProducts.find(p => p.id === actualId);

  if (!product) {
    notFound();
  }

  return (
    <main className="product-detail-page">
      <div className="product-header-area">
        <div className="breadcrumbs">
          <Link href="/">Главная</Link>
          <FiChevronRight className="separator" />
          <Link href="/catalog">Каталог</Link>
          <FiChevronRight className="separator" />
          <Link href={`/catalog?category=${product.category}`}>
            {categoryNames[product.category] || 'Товары'}
          </Link>
          <FiChevronRight className="separator" />
          <span className="current">{product.name}</span>
        </div>
      </div>
      <div className="product-container">
        <div className="image-section">
          <Image 
            src={product.imageUrl} 
            alt={product.name} 
            width={600} 
            height={600}
            className="main-image"
            unoptimized
          />
        </div>
        <div className="info-section">
          <h1>{product.name}</h1>
          <p className="price">{product.price.toLocaleString('ru-RU')} ₽</p>
          <p className="description">{product.description}</p>
          
          <AddToCartButton product={product} />
        </div>
      </div>
    </main>
  );
}
