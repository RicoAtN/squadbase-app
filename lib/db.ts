import { neon } from "@neondatabase/serverless";

const MAX_RETRIES = 2; // hard cap: 1 initial attempt + 2 retries = 3 calls max
const BASE_DELAY_MS = 150;

export type DbResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// Neon's HTTP driver is stateless: each query is a single fetch to Neon's
// pooled endpoint (PgBouncer), so no TCP connections are held per lambda.
// Use the "-pooler" connection string in DATABASE_URL.
let client: ReturnType<typeof neon> | null = null;

function getClient() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs a query with at most MAX_RETRIES retries (bounded loop, no recursion).
 * Never throws: returns a fallback error state instead.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<DbResult<T[]>> {
  let sql: ReturnType<typeof neon>;
  try {
    sql = getClient();
  } catch {
    return { ok: false, error: "Database is not configured." };
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const rows = await sql.query(text, params);
      return { ok: true, data: rows as T[] };
    } catch (err) {
      console.error(`[db] attempt ${attempt + 1} failed:`, err);
      if (attempt < MAX_RETRIES) await sleep(BASE_DELAY_MS * 2 ** attempt);
    }
  }
  return { ok: false, error: "Database temporarily unavailable." };
}
