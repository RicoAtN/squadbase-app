import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

/**
 * Connection safety
 * -----------------
 * - Neon's HTTP driver is stateless: one fetch per query against the pooled
 *   (PgBouncer, "-pooler") endpoint. No sockets are held open, so lambdas
 *   cannot leak connections.
 * - Every call goes through `safeQuery`: per-attempt timeout, at most
 *   MAX_RETRIES retries (bounded loop), and a circuit breaker that fails fast
 *   after repeated failures instead of hammering a struggling database.
 */

const MAX_RETRIES = 2; // 1 attempt + 2 retries = 3 calls max
const ATTEMPT_TIMEOUT_MS = 5_000;
const BASE_DELAY_MS = 150;
const BREAKER_THRESHOLD = 3; // consecutive failed calls before opening
const BREAKER_COOLDOWN_MS = 30_000;

export type DbResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_configured" | "circuit_open" | "unavailable" };

let _db: ReturnType<typeof createDb> | null = null;

function createDb(url: string) {
  return drizzle(neon(url), { schema });
}

function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) return null;
    _db = createDb(url);
  }
  return _db;
}

// Circuit breaker state (per server instance).
let consecutiveFailures = 0;
let openUntil = 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("db timeout")), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Run a Drizzle query safely. Never throws.
 *
 *   const r = await safeQuery((db) => db.select().from(teams).limit(1));
 */
export async function safeQuery<T>(
  fn: (db: NonNullable<ReturnType<typeof getDb>>) => Promise<T>,
): Promise<DbResult<T>> {
  const db = getDb();
  if (!db) return { ok: false, error: "not_configured" };

  if (Date.now() < openUntil) return { ok: false, error: "circuit_open" };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const data = await withTimeout(fn(db), ATTEMPT_TIMEOUT_MS);
      consecutiveFailures = 0;
      return { ok: true, data };
    } catch (err) {
      console.error(`[db] attempt ${attempt + 1}/${MAX_RETRIES + 1} failed`, err);
      if (attempt < MAX_RETRIES) await sleep(BASE_DELAY_MS * 2 ** attempt);
    }
  }

  consecutiveFailures++;
  if (consecutiveFailures >= BREAKER_THRESHOLD) {
    openUntil = Date.now() + BREAKER_COOLDOWN_MS;
    consecutiveFailures = 0;
  }
  return { ok: false, error: "unavailable" };
}
