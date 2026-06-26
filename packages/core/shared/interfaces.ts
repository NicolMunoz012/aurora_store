// =============================================================================
// @aurora/core/shared — Cross-Module Contracts
// Interfaces que definen los contratos entre módulos para desacoplamiento (Req 1.6).
// Cada módulo depende solo de la interfaz, no de la implementación concreta.
// =============================================================================

import type { Decimal } from "decimal.js";
import type {
  CreateAuditLogData,
  StockValidationResult,
  CartItemWithProduct,
  StoreConfigRecord,
} from "@aurora/shared";

// =============================================================================
// IAuditLogger — Contrato de auditoría cross-module
// Usado por: catalog, inventory, orders, store-config
// =============================================================================

/**
 * Servicio de logging de auditoría.
 * Cada módulo recibe esta interfaz para registrar acciones sin depender
 * de la implementación concreta del repositorio de auditoría.
 */
export interface IAuditLogger {
  log(data: CreateAuditLogData): Promise<void>;
}

// =============================================================================
// IInventoryService — Contrato de inventario cross-module
// Usado por: orders
// =============================================================================

/**
 * Servicio de inventario expuesto a otros módulos (principalmente orders).
 * Permite validar stock antes del checkout y gestionar deducciones/reversiones
 * asociadas a pedidos.
 */
export interface IInventoryService {
  /**
   * Valida que haya stock suficiente para todos los items solicitados.
   * @param items — Lista de productos con cantidades requeridas
   * @returns Resultado con flag `valid` e items insuficientes si aplica
   */
  validateStockForItems(
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<StockValidationResult>;

  /**
   * Deduce stock para un pedido confirmado.
   * @param orderId — ID del pedido cuyo stock se deducirá
   */
  deductStockForOrder(orderId: string): Promise<void>;

  /**
   * Revierte la deducción de stock de un pedido (cancelación, expiración).
   * @param orderId — ID del pedido cuyo stock se revertirá
   */
  revertStockForOrder(orderId: string): Promise<void>;
}

// =============================================================================
// IPricingService — Contrato de pricing cross-module
// Usado por: cart
// =============================================================================

/** Item resuelto con precios calculados */
export interface ResolvedCartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  mainImageUrl: string;
  quantity: number;
  stock: number;
  unitPrice: Decimal;
  retailPrice: Decimal;
  wholesalePrice: Decimal;
  lineTotal: Decimal;
}

/** Resultado completo del cálculo de precios del carrito */
export interface ResolvedCart {
  cartId: string;
  items: ResolvedCartItem[];
  retailSubtotal: Decimal;
  finalSubtotal: Decimal;
  wholesaleApplied: boolean;
  amountToThreshold: Decimal | null;
}

/**
 * Servicio de pricing expuesto a otros módulos (principalmente cart).
 * Resuelve los precios de un carrito según la configuración de la tienda
 * (umbral mayorista, precios por producto, etc.).
 */
export interface IPricingService {
  /**
   * Calcula precios finales para los items del carrito.
   * @param items — Items del carrito con datos de producto
   * @param config — Configuración actual de la tienda (umbral mayorista, etc.)
   * @param cartId — ID del carrito para incluirlo en el resultado
   * @returns Carrito resuelto con precios calculados
   */
  resolveCartPrices(
    items: CartItemWithProduct[],
    config: StoreConfigRecord,
    cartId: string,
  ): ResolvedCart;
}
