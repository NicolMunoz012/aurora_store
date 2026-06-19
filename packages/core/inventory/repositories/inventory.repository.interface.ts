// =============================================================================
// @aurora/core/inventory — IInventoryRepository
// Contrato puro de persistencia para el módulo de inventario (Req 1.6, 7.1–7.8).
// Sin dependencias de Prisma ni de ninguna implementación concreta.
// =============================================================================

import type {
  StockRecord,
  LowStockProduct,
  StockValidationResult,
} from "@aurora/shared";

/**
 * Repositorio de inventario.
 * Define las operaciones de lectura/escritura de stock que los Use Cases
 * del módulo inventory necesitan, sin acoplarse a la capa de infraestructura.
 */
export interface IInventoryRepository {
  /**
   * Busca el registro de stock de un producto.
   * @returns StockRecord o null si el producto no existe.
   */
  findProductStock(productId: string): Promise<StockRecord | null>;

  /**
   * Deduce stock de forma atómica. Usa UPDATE WHERE stock >= quantity.
   * @throws InsufficientStockError si no hay stock suficiente (0 filas afectadas).
   */
  deductStock(productId: string, quantity: number): Promise<StockRecord>;

  /**
   * Incrementa stock de forma atómica.
   */
  addStock(productId: string, quantity: number): Promise<StockRecord>;

  /**
   * Establece stock a un valor exacto.
   */
  setStock(productId: string, quantity: number): Promise<StockRecord>;

  /**
   * Retorna todos los productos cuyo stock está por debajo del umbral de alerta.
   */
  findLowStockProducts(): Promise<LowStockProduct[]>;

  /**
   * Valida que haya stock suficiente para una lista de items.
   * @returns Resultado con flag `valid` e items insuficientes si aplica.
   */
  validateStockForItems(
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<StockValidationResult>;
}
