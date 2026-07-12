import { mockProducts } from '../../../lib/mockData';
import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';
import './page.scss';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const actualId = resolvedParams.id.split('-')[0];
  let product = mockProducts.find(p => p.id === actualId);
  
  // if accessed via /product/test, we'll give them a mock product matching the photo
  if (!product && actualId === 'test') {
    product = {
      id: 'test',
      name: 'Худи Code Learn Create Repeat',
      price: 3690,
      description: 'Минималистичный худи для тех, кто живёт кодом и не перестаёт учиться. Мягкий, тёплый и удобный — идеально для учёбы, работы и отдыха.',
      imageUrl: '',
      category: 'hoodie',
      availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availableColors: ['blue', 'black', 'gray', 'beige'],
      materials: ['80% хлопок', '20% полиэстер']
    };
  }

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}
