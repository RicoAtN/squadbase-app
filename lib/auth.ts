import { createHash, randomBytes } from "node:crypto";

/** Magic login link TTL for self-service login requests (24 hours). */
export const LOGIN_TOKEN_TTL_MINUTES = 24 * 60; // 1440 minutes = 24 hours

/** Team invite link TTL for invitations sent by admin (7 days). */
export const INVITE_TOKEN_TTL_MINUTES = 7 * 24 * 60; // 10080 minutes = 7 days

export function newToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "squadbase.nl";
const dev = process.env.NODE_ENV !== "production";

/** Public URL of the team-manager app (where login lives). */
export const appUrl = () =>
  process.env.APP_URL ??
  (dev ? "http://app.localhost:3000" : `https://app.${ROOT_DOMAIN}`);

export const adminUrl = () =>
  process.env.ADMIN_URL ??
  (dev ? "http://admin.localhost:3000" : `https://admin.${ROOT_DOMAIN}`);

