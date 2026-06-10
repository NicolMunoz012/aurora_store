// =============================================================================
// @aurora/core/cart — getOrCreateCartUseCase
// Obtiene o crea un carrito ACTIVE para el usuario o sesión (Req 5.1).
// Garantiza unicidad: como máximo un carrito ACTIVE por usuario (DT-002).
// =============================================================================

import type { CartWithItems } from "@aurora/shared";
import type { GetOrCreateCartParams } from "../types.js";

export async function getOrCreateCartUseCase(
  params: GetOrCreateCartParams,
): Promise<CartWithItems> {
  const { repository, userId, sessionId } = params;

  // 1. Si hay userId, intentar encontrar su carrito activo
  if (userId) {
    const userCart = await repository.findActiveCartByUserId(userId);
    if (userCart) {
      return userCart;
    }
  }

  // 2. Si hay sessionId y no se encontró carrito de usuario, buscar por sesión
  if (sessionId) {
    const sessionCart = await repository.findActiveCartBySessionId(sessionId);
    if (sessionCart) {
      return sessionCart;
    }
  }

  // 3. No se encontró ninguno — crear uno nuevo
  await repository.createCart({ userId: userId ?? null, sessionId: sessionId ?? null });

  // 4. Retornar el carrito completo con items (CartWithItems)
  if (userId) {
    const newCart = await repository.findActiveCartByUserId(userId);
    if (newCart) {
      return newCart;
    }
  }

  if (sessionId) {
    const newCart = await repository.findActiveCartBySessionId(sessionId);
    if (newCart) {
      return newCart;
    }
  }

  // Fallback: esto no debería ocurrir si createCart funciona correctamente
  throw new Error("Failed to create or retrieve cart");
}
