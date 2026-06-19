/**
 * Discriminated union for all Server Action return values.
 * Ensures type-safe handling of success and error states in Client Components.
 */
export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string } };
