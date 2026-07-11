import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Худи RTF',
    description: 'Стильное худи с логотипом RTF. Идеально для повседневной носки.',
    price: 3690,
    imageUrl: '/category-hoodie-premium.png',
    category: 'hoodie',
    availableSizes: ['S', 'M', 'L', 'XL'],
    availableColors: ['black'],
  },
  {
    id: '2',
    name: 'Футболка Frontend Club',
    description: 'Светлая футболка для настоящих фронтендеров.',
    price: 1490,
    imageUrl: '/category-tshirt-premium.png',
    category: 'tshirt',
    availableSizes: ['S', 'M', 'L', 'XL'],
    availableColors: ['white'],
  },
  {
    id: '3',
    name: 'Стикерпак React',
    description: 'Набор виниловых стикеров с логотипами React, Next.js и Vercel.',
    price: 390,
    imageUrl: '/category-stickers-premium.png',
    category: 'sticker',
  },
  {
    id: '4',
    name: 'Кружка УрФУ',
    description: 'Керамическая кружка с логотипом УрФУ.',
    price: 690,
    imageUrl: '/category-accessories-premium.png',
    category: 'mug',
    availableColors: ['white'],
  },
  {
    id: '5',
    name: 'Шоппер Code Mode',
    description: 'Вместительный шоппер для ноутбука и конспектов.',
    price: 890,
    imageUrl: '/category-university-premium.png',
    category: 'other',
  },
  {
    id: '6',
    name: 'Блокнот Dev Notes',
    description: 'Черный блокнот для записи гениальных идей и архитектурных решений.',
    price: 590,
    imageUrl: '/category-teams-premium.png',
    category: 'other',
  }
];
