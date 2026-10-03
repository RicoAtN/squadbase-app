import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
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
 * - Deterministic SQL errors (constraint violations, bad SQL) are NOT retried
 *   and do NOT trip the breaker; they are returned as `query_failed`.
 */

const MAX_RETRIES = 2; // 1 attempt + 2 retries = 3 calls max
const ATTEMPT_TIMEOUT_MS = 5_000;
const BASE_DELAY_MS = 150;
const BREAKER_THRESHOLD = 3; // consecutive failed calls before opening
const BREAKER_COOLDOWN_MS = 30_000;

export type DbResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_configured" | "circuit_open" | "unavailable" }
  | { ok: false; error: "query_failed"; code: string };

let _db: ReturnType<typeof createDb> | null = null;

function createDb(url: string) {
  return drizzle(neon(url), { schema });
}

type Db = ReturnType<typeof createDb>;

function getDb(): Db | null {
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

/** Postgres SQLSTATE (e.g. "23505"), if the error came from the database. */
function sqlState(err: unknown): string | null {
  const e = err as { code?: unknown; cause?: { code?: unknown } } | null;
  const code = e?.code ?? e?.cause?.code;
  return typeof code === "string" && /^[0-9A-Z]{5}$/.test(code) ? code : null;
}

/**
 * Run a Drizzle query safely. Never throws.
 *
 *   const r = await safeQuery((db) => db.select().from(teams).limit(1));
 *
 * Pass `{ retries: 0 }` for non-idempotent writes.
 */
export async function safeQuery<T>(
  fn: (db: Db) => Promise<T>,
  opts: { retries?: number } = {},
): Promise<DbResult<T>> {
  const db = getDb();
  if (!db) return { ok: false, error: "not_configured" };

  if (Date.now() < openUntil) return { ok: false, error: "circuit_open" };

  const retries = Math.max(0, Math.min(opts.retries ?? MAX_RETRIES, MAX_RETRIES));

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await withTimeout(fn(db), ATTEMPT_TIMEOUT_MS);
      consecutiveFailures = 0;
      return { ok: true, data };
    } catch (err) {
      const code = sqlState(err);
      if (code) {
        // The database answered: deterministic failure, retrying won't help.
        return { ok: false, error: "query_failed", code };
      }
      console.error(`[db] attempt ${attempt + 1}/${retries + 1} failed`, err);
      if (attempt < retries) await sleep(BASE_DELAY_MS * 2 ** attempt);
    }
  }

  consecutiveFailures++;
  if (consecutiveFailures >= BREAKER_THRESHOLD) {
    openUntil = Date.now() + BREAKER_COOLDOWN_MS;
    consecutiveFailures = 0;
  }
  return { ok: false, error: "unavailable" };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * First statement of a tenant-scoped batch. Declares the tenant for RLS
 * policies. `is_local = true` limits it to the batch's transaction, so it can
 * never leak to another request on a pooled connection.
 *
 *   safeQuery((db) => db.batch([
 *     tenantScope(db, teamId),
 *     db.select().from(teamUsers),   // RLS sees only this team's rows
 *   ]));
 */
export function tenantScope(db: Db, teamId: string) {
  if (!UUID.test(teamId)) throw new Error("invalid team id");
  return db.execute(sql`select set_config('app.current_team_id', ${teamId}, true)`);
}
