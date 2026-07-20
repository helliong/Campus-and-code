export type CartSyncPayloadItem = {
  productId: string;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
};

export type DbCartSyncItem = CartSyncPayloadItem & {
  id: string;
  userId: string;
};

export type CartProductStock = {
  id: string;
  stockCount: number;
  inStock: boolean;
  variants: unknown;
};

type StockVariant = { color?: string; size?: string; stock?: number };

function normalizeOption(value?: string | null) {
  return value || null;
}

export function filterValidCartItems(
  localCart: CartSyncPayloadItem[],
  validProductIds: Set<string>,
) {
  return localCart.filter((item) => validProductIds.has(item.productId));
}

export function isSameCartVariant(
  first: CartSyncPayloadItem,
  second: CartSyncPayloadItem,
) {
  return (
    first.productId === second.productId &&
    normalizeOption(first.selectedSize) === normalizeOption(second.selectedSize) &&
    normalizeOption(first.selectedColor) === normalizeOption(second.selectedColor)
  );
}

export function mergeCartItems(
  dbCartItems: DbCartSyncItem[],
  localCart: CartSyncPayloadItem[],
  validProductIds: Set<string>,
  userId: string,
) {
  const mergedCart = dbCartItems.map((item) => ({ ...item }));
  const validLocalCart = filterValidCartItems(localCart, validProductIds);

  for (const localItem of validLocalCart) {
    const existingDbItemIndex = mergedCart.findIndex((dbItem) =>
      isSameCartVariant(dbItem, localItem),
    );

    if (existingDbItemIndex > -1) {
      mergedCart[existingDbItemIndex].quantity += localItem.quantity;
    } else {
      mergedCart.push({
        id: "new",
        userId,
        productId: localItem.productId,
        quantity: localItem.quantity,
        selectedSize: normalizeOption(localItem.selectedSize),
        selectedColor: normalizeOption(localItem.selectedColor),
      });
    }
  }

  return mergedCart;
}

export function limitCartItemsToStock<T extends CartSyncPayloadItem>(
  cartItems: T[],
  products: CartProductStock[],
) {
  const productsById = new Map(products.map((product) => [product.id, product]));

  return cartItems.flatMap((item) => {
    const product = productsById.get(item.productId);
    if (!product || !product.inStock) return [];
    const variants = Array.isArray(product.variants) ? product.variants as StockVariant[] : [];
    const variant = variants.find(
      (candidate) =>
        normalizeOption(candidate.size) === normalizeOption(item.selectedSize)
        && normalizeOption(candidate.color) === normalizeOption(item.selectedColor),
    );
    const availableStock = variants.length > 0
      ? Math.max(0, Number(variant?.stock) || 0)
      : Math.max(0, product.stockCount);
    const quantity = Math.min(Math.max(0, Math.floor(Number(item.quantity) || 0)), availableStock);

    return quantity > 0 ? [{ ...item, quantity }] : [];
  });
}
