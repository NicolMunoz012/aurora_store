import { AuroraError } from "@aurora/shared";
import { isDbConnectionError } from "@/lib/db";
import type { ActionResult } from "@/lib/types";

/**
 * Converts any thrown error into a typed ActionResult error shape.
 * - AuroraError → uses its code and message
 * - Connection errors → returns DB_CONNECTION_ERROR (retryable)
 * - Unknown errors → logs to console.error and returns a generic INTERNAL_ERROR
 */
export function handleActionError<T>(error: unknown): ActionResult<T> {
  if (error instanceof AuroraError) {
    return {
      data: null,
      error: {
        code: error.code,
        message: error.message,
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
