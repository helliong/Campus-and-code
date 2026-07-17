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
