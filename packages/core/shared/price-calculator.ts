// =============================================================================
// @aurora/core — Price Calculator (shared pure functions)
// Lógica de cálculo de subtotal detal y evaluación del umbral mayorista.
// Usa Decimal para aritmética monetaria precisa (Req 12.5, RF017).
// =============================================================================

import { Decimal } from "decimal.js";
import type { CartItemWithProduct } from "@aurora/shared";

/**
 * Calcula el subtotal a precio detal del carrito.
 *
 * PRECONDICIONES:
 *   - Cada item.product.retailPrice es un Decimal válido > 0
 *   - Cada item.quantity >= 1
 *
 * POSTCONDICIÓN:
 *   - Retorna sum(item.product.retailPrice * item.quantity) para todos los items
 *   - Si items está vacío, retorna Decimal(0)
 *
 * @param items - Array de items del carrito con producto expandido
 * @returns Subtotal calculado a precios detal usando aritmética Decimal
 *
 * Validates: Requirements 6.1
 */
export function calculateRetailSubtotal(items: CartItemWithProduct[]): Decimal {
  return items.reduce(
    (sum, item) => sum.add(item.product.retailPrice.mul(item.quantity)),
    new Decimal(0),
  );
}

/**
 * Determina si el subtotal detal alcanza o supera el umbral mayorista.
 *
 * POSTCONDICIÓN:
 *   - Retorna true si retailSubtotal >= threshold
 *   - Retorna false en caso contrario
 *
 * @param retailSubtotal - Subtotal calculado a precios detal
 * @param threshold - Umbral mayorista desde StoreConfig.wholesaleThreshold
 * @returns true si el umbral se cumple o se supera
 *
 * Validates: Requirements 12.5
 */
export function isWholesaleThresholdMet(
  retailSubtotal: Decimal,
  threshold: Decimal,
): boolean {
  return retailSubtotal.gte(threshold);
}

/**
 * Calcula el precio con descuento aplicado.
 * Si no hay descuento (null/0), retorna el precio original.
 * Redondea hacia abajo al entero más cercano (COP no usa decimales).
 *
 * @param price - Precio original (Decimal)
 * @param discountPercentage - Porcentaje de descuento (5, 10, 15, 20, 25, 30) o null
 * @returns Precio final con descuento aplicado
 */
export function calculateDiscountedPrice(
  price: Decimal,
  discountPercentage: number | null,
): Decimal {
  if (!discountPercentage || discountPercentage <= 0) return price;
  const discount = price.mul(discountPercentage).div(100);
  return price.sub(discount).floor();
}
