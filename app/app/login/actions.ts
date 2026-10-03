"use server";

import { and, count, eq, gt, isNull, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { loginTokens, users } from "@/db/schema";
import { hashToken, newToken, LOGIN_TOKEN_TTL_MINUTES } from "@/lib/auth";
import { safeQuery } from "@/lib/db";
import { sendLoginEmail } from "@/lib/mail";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = {
  ok: boolean;
  message: string;
  devLink?: string;
} | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LINKS_PER_WINDOW = 20;

const GENERIC = {
  ok: true,
  message: "Als dit e-mailadres bekend is, sturen we je een inloglink.",
} as const;

/**
 * Step 1: request link.
 */
export async function requestLogin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return { ok: false, message: "Vul een geldig e-mailadres in." };
  }

  const found = await safeQuery((db) =>
    db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1),
  );
  if (!found.ok) {
    return { ok: false, message: "Er ging iets mis met de database. Probeer het zo opnieuw." };
  }
  const user = found.data[0];
  if (!user) return GENERIC;

  // Rate limit
  const recent = await safeQuery((db) =>
    db
      .select({ n: count() })
      .from(loginTokens)
      .where(
        and(
          eq(loginTokens.userId, user.id),
          gt(
            loginTokens.createdAt,
            sql`now() - make_interval(mins => ${LOGIN_TOKEN_TTL_MINUTES})`,
          ),
        ),
      ),
  );
  if (!recent.ok) {
    return { ok: false, message: "Er ging iets mis. Probeer het zo opnieuw." };
  }
  if (recent.data[0].n >= MAX_LINKS_PER_WINDOW) return GENERIC;

  const { token, hash } = newToken();
  const saved = await safeQuery(
    (db) =>
      db.insert(loginTokens).values({
        userId: user.id,
        tokenHash: hash,
        expiresAt: sql`now() + make_interval(mins => ${LOGIN_TOKEN_TTL_MINUTES})`,
      }),
    { retries: 0 },
  );
  if (!saved.ok) {
    return { ok: false, message: "Er ging iets mis bij het aanmaken van de token." };
  }

  // Resolve current host from request headers
  const reqHeaders = await headers();
  const host = reqHeaders.get("host") ?? "app.localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = `${proto}://${host}`;

  const link = `${origin}/login/verify?token=${encodeURIComponent(token)}`;
  after(() => sendLoginEmail(email, link));

  if (!process.env.RESEND_API_KEY || process.env.NODE_ENV !== "production") {
    return {
      ok: true,
      message: "Inloglink succesvol gegenereerd!",
      devLink: link,
    };
  }

  return GENERIC;
}

/**
 * Consumes token atomically and establishes session.
 */
export async function verifyAndLogin(token: string) {
  if (!token || token.length < 20 || token.length > 100) return null;

  const hash = hashToken(token);
  const r = await safeQuery(
    (db) =>
      db
        .update(loginTokens)
        .set({ usedAt: sql`now()` })
        .where(
          and(
            eq(loginTokens.tokenHash, hash),
            isNull(loginTokens.usedAt),
            gt(loginTokens.expiresAt, sql`now()`),
          ),
        )
        .returning({ userId: loginTokens.userId }),
    { retries: 0 },
  );

  const userId = r.ok ? r.data[0]?.userId : undefined;
  if (!userId) return null;

  await createSession(userId);

  const userQuery = await safeQuery((db) =>
    db.select({ globalRole: users.globalRole }).from(users).where(eq(users.id, userId)).limit(1),
  );

  return userQuery.ok ? userQuery.data[0]?.globalRole ?? "user" : "user";
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
