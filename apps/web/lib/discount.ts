// =============================================================================
// apps/web/lib/discount.ts — Utilidades de descuento centralizadas
// ÚNICA fuente de verdad para lógica de descuento en el frontend.
// =============================================================================

/** Porcentajes de descuento permitidos */
export const DISCOUNT_PERCENTAGES = [5, 10, 15, 20, 25, 30] as const;

export type DiscountPercentage = (typeof DISCOUNT_PERCENTAGES)[number];

/** Valida que un valor sea un porcentaje de descuento válido */
export function isValidDiscount(value: number): value is DiscountPercentage {
  return DISCOUNT_PERCENTAGES.includes(value as DiscountPercentage);
}

/** Calcula el precio con descuento. Redondea hacia abajo (COP sin decimales). */
export function getDiscountedPrice(price: number, discountPercentage: number | null): number {
  if (!discountPercentage || discountPercentage <= 0) return price;
  return Math.floor(price - (price * discountPercentage) / 100);
}

/** Calcula el ahorro en pesos */
export function getSavings(price: number, discountPercentage: number | null): number {
  if (!discountPercentage || discountPercentage <= 0) return 0;
  return price - getDiscountedPrice(price, discountPercentage);
}

/** Formatea un valor numérico como COP */
export function formatCOP(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(num);
}
