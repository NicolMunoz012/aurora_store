import { AuroraError } from "@aurora/shared";
import { isDbConnectionError } from "@/lib/db";
import type { ActionResult } from "@/lib/types";

/**
 * Maps AuroraError codes to user-friendly Spanish messages.
 * Fallback to the original English message if no mapping exists.
 */
const SPANISH_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_DUPLICATE_NAME: "Ya existe un producto con ese nombre.",
  PRODUCT_NOT_FOUND: "Producto no encontrado.",
  PRODUCT_REQUIRES_IMAGE: "El producto requiere al menos una imagen.",
  USER_NOT_FOUND: "Usuario no encontrado.",
  UNAUTHORIZED_ROLE: "No tienes permisos para realizar esta acción.",
  INSUFFICIENT_STOCK: "Stock insuficiente para este producto.",
  CART_NOT_FOUND: "Carrito no encontrado.",
  ORDER_NOT_FOUND: "Pedido no encontrado.",
  EMAIL_ALREADY_IN_USE: "Este correo electrónico ya está en uso.",
};

/**
 * Converts any thrown error into a typed ActionResult error shape.
 * - AuroraError → uses its code and a Spanish message when available
 * - Connection errors → returns DB_CONNECTION_ERROR (retryable)
 * - Unknown errors → logs to console.error and returns a generic INTERNAL_ERROR
 */
export function handleActionError<T>(error: unknown): ActionResult<T> {
  if (error instanceof AuroraError) {
    const spanishMessage = SPANISH_ERROR_MESSAGES[error.code] ?? error.message;
    return {
      data: null,
      error: {
        code: error.code,
        message: spanishMessage,
      },
    };
  }

  if (isDbConnectionError(error)) {
    console.error("[Server Action Error] DB connection lost:", (error as Error).message);
    return {
      data: null,
      error: {
        code: "DB_CONNECTION_ERROR",
        message: "Error de conexión con la base de datos. Recarga la página e intenta de nuevo.",
      },
    };
  }

  console.error("[Server Action Error]", error);
  return {
    data: null,
    error: {
      code: "INTERNAL_ERROR",
      message: "Ha ocurrido un error. Intenta de nuevo.",
    },
  };
}
