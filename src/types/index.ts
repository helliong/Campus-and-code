export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'hoodie' | 'tshirt' | 'mug' | 'sticker' | 'accessories' | 'other';
  availableSizes?: string[]; // e.g. ['S', 'M', 'L', 'XL']
  availableColors?: string[]; // e.g. ['black', 'white', 'gray']
  materials?: string[]; // e.g. ['Хлопок', 'Полиэстер']
  inStock?: boolean;
  universityId?: string | null;
  oldPrice?: number | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'developer' | 'designer';
}
