import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { safeQuery } from "@/lib/db";

// Never cache: this must reflect the live database state.
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await safeQuery((db) => db.execute(sql`select 1`));

  if (!result.ok) {
    // Only a coarse reason is exposed; details stay in server logs.
    return NextResponse.json(
      { status: "error", reason: result.error },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
