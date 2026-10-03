import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { users } from "@/db/schema";
import { safeQuery } from "@/lib/db";

/**
 * Minimal signed-cookie session: `<userId>.<expiryUnix>.<hmac>`.
 * The cookie proves WHO the user is. Authorization (global_role, team role)
 * is always re-read from the database, never trusted from the cookie.
 * Fails closed: any problem (missing secret, bad signature, expired, unknown
 * user) means "not signed in".
 *
 * A login flow (magic link / OAuth) should call `createSession(userId)`.
 */

const COOKIE = "sb_session";
const TTL_SECONDS = 60 * 60 * 8;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET missing or too short");
  return s;
}

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export async function createSession(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${userId}.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
    // e.g. ".squadbase.nl" to share the session between admin. and app.
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
}

export async function destroySession() {
  (await cookies()).delete({
    name: COOKIE,
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
}

function verify(token: string): string | null {
  const [userId, exp, sig, ...rest] = token.split(".");
  if (!userId || !exp || !sig || rest.length) return null;
  const expected = Buffer.from(sign(`${userId}.${exp}`));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }
  if (!Number.isFinite(+exp) || +exp < Date.now() / 1000) return null;
  return userId;
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  globalRole: "user" | "superadmin";
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const userId = verify(token);
    if (!userId) return null;

    const r = await safeQuery((db) =>
      db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          globalRole: users.globalRole,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1),
    );
    return r.ok ? (r.data[0] ?? null) : null;
  } catch {
    return null;
  }
});

/** Returns the user only if they are a superadmin (role read from the DB). */
export async function requireSuperadmin(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user?.globalRole === "superadmin" ? user : null;
}
