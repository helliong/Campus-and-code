import { Role } from "@prisma/client";
import { getStudentDiscountAmount } from "@/lib/cart/pricing";

export const deliveryPrices = {
  courier: 290,
  post: 390,
  cdek: 350,
} as const;

const promoCodes = {
  CAMPUS10: { discountPercent: 10, minOrderTotal: 1_000 },
  CODE5: { discountPercent: 5, minOrderTotal: 0 },
} as const;

export type DeliveryMethod = keyof typeof deliveryPrices;

export function isDeliveryMethod(value: unknown): value is DeliveryMethod {
  return typeof value === "string" && value in deliveryPrices;
}

export function calculateOrderPrice({
  productsTotal,
  role,
  deliveryMethod,
  promoCode,
}: {
  productsTotal: number;
  role: Role;
  deliveryMethod: DeliveryMethod;
  promoCode?: string;
}) {
  const studentDiscount = role === Role.STUDENT
    ? getStudentDiscountAmount(productsTotal)
    : 0;
  const normalizedPromoCode = promoCode?.trim().toUpperCase() || undefined;
  const promo = normalizedPromoCode
    ? promoCodes[normalizedPromoCode as keyof typeof promoCodes]
    : undefined;
  const afterStudentDiscount = Math.max(productsTotal - studentDiscount, 0);
  const promoDiscount = promo && productsTotal >= promo.minOrderTotal
    ? Math.floor((afterStudentDiscount * promo.discountPercent) / 100)
    : 0;
  const deliveryPrice = deliveryPrices[deliveryMethod];

  return {
    productsTotal,
    studentDiscount,
    promoCode: promoDiscount > 0 ? normalizedPromoCode : undefined,
    promoDiscount,
    deliveryPrice,
    total: Math.max(afterStudentDiscount - promoDiscount + deliveryPrice, 0),
  };
}
