import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@aurora/database";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // Prevent stale connections — server closes idle ones after ~5 min
    idleTimeoutMillis: 30_000,
    // Fail fast instead of hanging the request
    connectionTimeoutMillis: 10_000,
    // Cap connections; Next.js dev reloads can spawn many instances
    max: 10,
    // Allow re-use across requests without holding slots too long
    allowExitOnIdle: true,
  });

  // Log pool errors so they show in server logs instead of crashing silently
  pool.on("error", (err) => {
    console.error("[DB Pool] Unexpected error on idle client:", err.message);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ─── Connection-error retry helper ───────────────────────────────────────────
// Prisma over pg can throw "Connection terminated unexpectedly" when the pool
// has a stale socket. A single retry is almost always enough to get a fresh one.
export const RETRYABLE_MESSAGES = [
  "connection terminated unexpectedly",
  "connection terminated",
  "server closed the connection unexpectedly",
  "connection reset by peer",
  "econnreset",
  "econnrefused",
  "socket hang up",
];

export function isDbConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return RETRYABLE_MESSAGES.some((m) => msg.includes(m));
}

/**
 * Wraps a Prisma query with a single automatic retry on transient connection
 * errors. Use this in Server Actions and Server Components.
 *
 * @example
 *   const brands = await withDbRetry(() => prisma.brand.findMany());
 */
export async function withDbRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0 && isDbConnectionError(err)) {
      console.warn("[DB] Connection error, retrying once…", (err as Error).message);
      await new Promise((r) => setTimeout(r, 100)); // small back-off
      return withDbRetry(fn, retries - 1);
    }
    throw err;
  }
}
