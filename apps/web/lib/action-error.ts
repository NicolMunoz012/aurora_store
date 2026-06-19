import { AuroraError } from "@aurora/shared";
import type { ActionResult } from "@/lib/types";

/**
 * Converts any thrown error into a typed ActionResult error shape.
 * - AuroraError → uses its code and message
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

  console.error("[Server Action Error]", error);
  return {
    data: null,
    error: {
      code: "INTERNAL_ERROR",
      message: "Ha ocurrido un error. Intenta de nuevo.",
    },
  };
}
