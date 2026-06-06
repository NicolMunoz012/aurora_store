/**
 * Interfaz Clock — abstracción para obtener la fecha/hora actual.
 * Permite inyectar un reloj determinista en tests (Requirements 8.4, 8.5, 8.12).
 */
export interface Clock {
  now(): Date;
}

/**
 * Implementación por defecto que retorna la fecha/hora real del sistema.
 */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

/**
 * Factory que crea un Clock determinista para tests.
 * El reloj siempre retorna la misma fecha fija proporcionada.
 */
export function createTestClock(fixedDate: Date): Clock {
  return {
    now(): Date {
      return fixedDate;
    },
  };
}
