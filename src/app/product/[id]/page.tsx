import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';
import { prisma } from '@/lib/prisma';
import './page.scss';

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ color?: string; size?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const fullPath = decodeURIComponent(resolvedParams.id);
  const actualId = fullPath.split('-')[0];
  const initialVariant = {
    color: resolvedSearchParams?.color,
    size: resolvedSearchParams?.size,
  };
  
  // 1. Попробуем найти по полному совпадению slug (если мы сохраняем slug в таком виде)
  let product = await prisma.product.findUnique({
    where: { slug: fullPath },
    include: { university: true }
  });

  // 2. Если не нашли, возможно это старая ссылка (id-название), где ID до первого дефиса
  if (!product) {
    product = await prisma.product.findUnique({
      where: { id: actualId },
      include: { university: true }
    });
  }
  
  // 3. Если не нашли, возможно это новая ссылка (SKU-название), где SKU содержит дефисы (например RTF-THIST)
  if (!product) {
    // В этом случае мы не можем просто сделать split('-')[0]. 
    // Поскольку база небольшая, мы можем вытащить все продукты и найти совпадение
    const allProducts = await prisma.product.findMany({
      select: { id: true, sku: true, name: true }
    });
    
    // Используем единую функцию генерации слага
    const { generateSlug } = await import('@/lib/utils');

    const matched = allProducts.find(p => p.sku && fullPath === `${p.sku}-${generateSlug(p.name)}`);
    
    if (matched) {
      product = await prisma.product.findUnique({
        where: { id: matched.id },
        include: { university: true }
      });
    }
  }

  // 4. Наконец, если просто искали по точному SKU
  if (!product) {
    product = await prisma.product.findFirst({
      where: { sku: fullPath },
      include: { university: true }
    });
  }
  
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
      return <ProductClient product={testProduct as any} initialVariant={initialVariant} />;
    }
    
    notFound();
  }

  return <ProductClient product={product as any} initialVariant={initialVariant} />;
}
