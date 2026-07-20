import { Product, ProductVariant } from "@/types";

export const variantKey = (color?: string, size?: string) =>
  `${color || "none"}::${size || "none"}`;

export function getProductImagesForColor(product: Product, color?: string) {
  if (color && product.imagesByColor?.[color]?.length) {
    return product.imagesByColor[color];
  }

  return product.images?.length ? product.images : [product.imageUrl].filter(Boolean);
}

export function getVariantStock(
  variants: ProductVariant[] | undefined,
  color?: string,
  size?: string,
) {
  const variant = variants?.find(
    (item) => item.color === color && item.size === size,
  );

  return variant?.stock;
}

export function getProductAvailableStock(
  product: Product,
  color?: string,
  size?: string,
) {
  const variantStock = getVariantStock(product.variants, color, size);
  if (variantStock !== undefined) return Math.max(0, variantStock);
  if (product.variants?.length) return 0;
  if (product.inStock === false) return 0;
  if (typeof product.stockCount === "number") return Math.max(0, product.stockCount);
  return Number.POSITIVE_INFINITY;
}

export function hasVariantStock(
  product: Product,
  color?: string,
  size?: string,
) {
  return getProductAvailableStock(product, color, size) > 0;
}

export function getAvailableSizesForColor(product: Product, color?: string) {
  if (!product.availableSizes?.length || !product.variants?.length) {
    return product.availableSizes || [];
  }

  return product.availableSizes.filter((size) =>
    hasVariantStock(product, color, size),
  );
}
