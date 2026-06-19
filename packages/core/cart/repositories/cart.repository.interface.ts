// =============================================================================
// @aurora/core/cart — ICartRepository
// Contrato puro de persistencia para el módulo de carrito (Req 1.6, 5.1–5.7).
// Sin dependencias de Prisma ni de ninguna implementación concreta.
// =============================================================================

import type {
  CartWithItems,
  CartRecord,
  CartItemRecord,
  CartStatus,
  CreateCartData,
} from "@aurora/shared";

/**
 * Repositorio de carrito de compras.
 * Define las operaciones de lectura/escritura que los Use Cases
 * del módulo cart necesitan, sin acoplarse a la capa de infraestructura.
 */
export interface ICartRepository {
  /**
   * Busca el carrito ACTIVE de un usuario autenticado.
   * @returns El carrito con sus items y datos de producto, o null si no existe.
   */
  findActiveCartByUserId(userId: string): Promise<CartWithItems | null>;

  /**
   * Busca el carrito ACTIVE de una sesión anónima.
   * @returns El carrito con sus items y datos de producto, o null si no existe.
   */
  findActiveCartBySessionId(sessionId: string): Promise<CartWithItems | null>;

  /**
   * Crea un nuevo carrito.
   * @returns El registro del carrito creado.
   */
  createCart(data: CreateCartData): Promise<CartRecord>;

  /**
   * Agrega un item al carrito.
   * @returns El registro del item creado.
   */
  addItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItemRecord>;

  /**
   * Actualiza la cantidad de un item del carrito.
   * @returns El registro del item actualizado.
   */
  updateItemQuantity(
    cartItemId: string,
    quantity: number,
  ): Promise<CartItemRecord>;

  /**
   * Elimina un item del carrito.
   */
  removeItem(cartItemId: string): Promise<void>;

  /**
   * Elimina todos los items de un carrito.
   */
  clearItems(cartId: string): Promise<void>;

  /**
   * Fusiona los items del carrito fuente al carrito destino.
   * Para productos duplicados, suma las cantidades. Se ejecuta atómicamente.
   */
  mergeCartItems(sourceCartId: string, targetCartId: string): Promise<void>;

  /**
   * Establece el estado de un carrito.
   * Si clearSessionId es true, también limpia el sessionId (invariante DA-002).
   */
  setCartStatus(
    cartId: string,
    status: CartStatus,
    clearSessionId?: boolean,
  ): Promise<void>;

  /**
   * Busca un item existente en el carrito para un producto dado.
   * Útil para deduplicación al agregar items (RF016).
   * @returns El registro del item o null si no existe.
   */
  findCartItemByProduct(
    cartId: string,
    productId: string,
  ): Promise<CartItemRecord | null>;
}
