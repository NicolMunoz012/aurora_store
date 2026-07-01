import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@aurora/database";

// ─── Singleton — one Pool, one PrismaClient, for the entire process lifetime ──
//
// WHY globalThis:
//   Next.js hot-reloads modules in dev, re-running module-level code on each
//   reload. Without globalThis the singleton would be re-created on every hot
//   reload, opening a new Pool. In production the module is only evaluated once
//   but we keep the same pattern for consistency.
//
// WHY no conditional (process.env.NODE_ENV !== "production"):
//   The old code only assigned the singleton in dev. In production nothing was
//   stored, so every cold-start could create a new instance. Now we always store.
const g = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },

    // Maximum simultaneous pg connections this process may hold.
    // InsForge free tier — keep this low so multiple dynos/instances
    // can coexist without hitting P2037.
    max: 3,

    // Release idle connections after 20 s so they don't accumulate
    // when the process is quiet between requests.
    idleTimeoutMillis: 20_000,

    // Fail the query quickly rather than queuing indefinitely behind
    // a saturated pool.
    connectionTimeoutMillis: 8_000,

    // DO NOT set allowExitOnIdle — it destroys the pool while the
    // process is still alive, causing every subsequent request to fail.
  });

  pool.on("error", (err) => {
    // Surface unexpected idle-client errors in server logs.
    console.error("[DB Pool] Idle client error:", err.message);
  });

  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

// Always store on globalThis — works correctly in both dev and production.
export const prisma: PrismaClient = g.prisma ?? (g.prisma = createPrismaClient());

// ─── Connection-error classifier ─────────────────────────────────────────────

const RETRYABLE_MESSAGES = [
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
 * Retries a single Prisma query ONCE on transient connection errors.
 *
 * Rules:
 * - Do NOT nest withDbRetry inside another withDbRetry call.
 * - Do NOT pass a function that internally calls withDbRetry again.
 * - One retry level only — avoids connection storms on a degraded DB.
 */
export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isDbConnectionError(err)) {
      console.warn("[DB] Transient connection error, retrying once:", (err as Error).message);
      await new Promise((r) => setTimeout(r, 150));
      // Second attempt — no further retry
      return fn();
    }
    throw err;
  }
}
