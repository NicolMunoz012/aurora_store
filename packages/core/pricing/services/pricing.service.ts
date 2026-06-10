// =============================================================================
// @aurora/core/pricing — PricingService
// Servicio puro de cálculo de precios del carrito.
// Implementa IPricingService (contrato cross-module) para resolver precios
// según umbral mayorista y configuración de tienda (Req 6.1–6.8, 12.5).
//
// NOTA: minWholesaleQty es ESTRICTAMENTE INFORMACIONAL — NO se usa aquí (Req 6.7).
// El único criterio para activar precio mayorista es:
//   retailSubtotal >= config.wholesaleThreshold (Req 6.2, 6.3).
// =============================================================================

import { Decimal } from "decimal.js";
import type { CartItemWithProduct, StoreConfigRecord } from "@aurora/shared";
import type {
  IPricingService,
  ResolvedCart,
  ResolvedCartItem,
} from "../../shared/interfaces.js";
import {
  calculateRetailSubtotal,
  isWholesaleThresholdMet,
} from "../../shared/price-calculator.js";

/**
 * Servicio de pricing — puro y sincrónico.
 *
 * Resuelve los precios finales de un carrito en base a la configuración
 * de la tienda. Toda la aritmética monetaria usa Decimal (Req 12.5).
 */
export class PricingService implements IPricingService {
  /**
   * Calcula precios finales para los items del carrito.
   *
   * @param items — Items del carrito con datos de producto expandidos
   * @param config — Configuración actual de la tienda (umbral mayorista, etc.)
   * @returns Carrito resuelto con precios calculados
   */
  resolveCartPrices(
    items: CartItemWithProduct[],
    config: StoreConfigRecord,
  ): ResolvedCart {
    // 1. Calcular subtotal a precio detal (Req 6.1)
    const retailSubtotal = calculateRetailSubtotal(items);

    // 2. Determinar si se aplica precio mayorista (Req 6.2, 6.3)
    const wholesaleApplied = isWholesaleThresholdMet(
      retailSubtotal,
      config.wholesaleThreshold,
    );

    // 3. Mapear cada item a ResolvedCartItem con precios resueltos
    const resolvedItems: ResolvedCartItem[] = items.map((item) => {
      const unitPrice = wholesaleApplied
        ? item.product.wholesalePrice
        : item.product.retailPrice;

      const lineTotal = unitPrice.mul(item.quantity);

      return {
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice,
        retailPrice: item.product.retailPrice,
        wholesalePrice: item.product.wholesalePrice,
        lineTotal,
      };
    });

    // 4. Calcular subtotal final (suma de lineTotals)
    const finalSubtotal = resolvedItems.reduce(
      (sum, item) => sum.add(item.lineTotal),
      new Decimal(0),
    );

    // 5. Calcular monto restante para alcanzar umbral mayorista (Req 6.4)
    const amountToThreshold = wholesaleApplied
      ? null
      : config.wholesaleThreshold.sub(retailSubtotal);

    // 6. Retornar carrito resuelto
    return {
      items: resolvedItems,
      retailSubtotal,
      finalSubtotal,
      wholesaleApplied,
      amountToThreshold,
    };
  }
}
