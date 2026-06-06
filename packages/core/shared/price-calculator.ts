// =============================================================================
// @aurora/core — Price Calculator (shared pure functions)
// Lógica de cálculo de subtotal detal y evaluación del umbral mayorista.
// Usa Decimal para aritmética monetaria precisa (Req 12.5, RF017).
// =============================================================================

import Decimal from "decimal.js";
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
