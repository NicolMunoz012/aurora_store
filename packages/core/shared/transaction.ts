/**
 * Type representing the interactive transaction client that Prisma passes
 * to the callback of `prisma.$transaction(async (tx) => { ... })`.
 * It has the same query API as PrismaClient but without connection/lifecycle methods.
 */
export type TransactionClient = Omit<
  PrismaLike,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Minimal interface representing a PrismaClient instance with the interactive
 * transaction method. This avoids a direct import from generated code that
 * breaks rootDir constraints in the monorepo. Any PrismaClient instance
 * satisfies this interface.
 */
interface PrismaLike {
  $transaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T>;
  [key: string]: unknown;
}

/**
 * Wraps a callback in a Prisma interactive transaction.
 *
 * @param prisma - The PrismaClient instance.
 * @param fn - The callback that receives the transaction client and returns a Promise.
 * @returns The result of the callback.
 *
 * @example
 * ```ts
 * const order = await withTransaction(prisma, async (tx) => {
 *   const created = await tx.order.create({ data: { ... } });
 *   await tx.product.update({ where: { id }, data: { stock: { decrement: qty } } });
 *   return created;
 * });
 * ```
 *
 * Validates: Requirements 7.1, 7.4
 */
export async function withTransaction<T>(
  prisma: PrismaLike,
  fn: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => fn(tx));
}
