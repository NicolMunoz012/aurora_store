import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@aurora/database";

// ─── Singleton — persists across requests in both dev and production ──────────
// In production Next.js runs in a long-lived Node process; we must reuse the
// same Pool instance to avoid opening a new connection on every request.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },

    // Keep idle connections alive — the DB server closes them after ~10 min.
    // 30 s idle timeout ensures we drop them first and avoid "connection
    // terminated unexpectedly" errors on the NEXT request.
    idleTimeoutMillis: 30_000,

    // Give up quickly if no connection is available rather than hanging.
    connectionTimeoutMillis: 10_000,

    // Conservative cap — avoids exhausting the DB connection limit.
    max: 5,

    // !! Do NOT set allowExitOnIdle — it destroys the pool while the process
    // is still alive (production), causing every subsequent request to fail.
  });

  // Surface idle-client errors in server logs instead of silent crashes.
  pool.on("error", (err) => {
    console.error("[DB Pool] Idle client error:", err.message);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Store the singleton on globalThis so it survives hot-reloads in dev AND
// is shared across the whole production process lifetime.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

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
 * errors. Use in Server Actions and Server Components.
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
      await new Promise((r) => setTimeout(r, 150));
      return withDbRetry(fn, retries - 1);
    }
    throw err;
  }
}
