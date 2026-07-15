import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';
import { prisma } from '@/lib/prisma';
import './page.scss';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const actualId = resolvedParams.id.split('-')[0];
  
  const product = await prisma.product.findUnique({
    where: { id: actualId },
    include: { university: true }
  });
  
  if (!product) {
    if (actualId === 'test') {
      const testProduct = {
        id: 'test',
        name: 'Худи Code Learn Create Repeat',
        price: 3690,
        description: 'Минималистичный худи для тех, кто живёт кодом и не перестаёт учиться. Мягкий, тёплый и удобный — идеально для учёбы, работы и отдыха.',
        imageUrl: '',
        category: 'hoodie',
        availableSizes: ['S', 'M', 'L', 'XL'],
        availableColors: ['blue', 'black', 'gray', 'beige'],
        materials: ['80% хлопок', '20% полиэстер'],
        inStock: true
      };
      return <ProductClient product={testProduct as any} />;
    }
    
    notFound();
  }

  return <ProductClient product={product as any} />;
}
