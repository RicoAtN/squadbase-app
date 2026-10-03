import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const globalRole = pgEnum("global_role", ["user", "superadmin"]);
export const teamRole = pgEnum("team_role", ["manager", "player"]);

/** Design tokens and customization for a team's public pages. */
export type ThemeSettings = {
  primary_color?: string;
  logo_emoji?: string;
  logo_url?: string;
  tagline?: string;
  description?: string;
  home_ground?: string;
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  globalRole: globalRole("global_role").notNull().default("user"),
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  themeSettings: jsonb("theme_settings")
    .$type<ThemeSettings>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Tenant-scoped table. Every future tenant table (matches, fines, stats, ...)
 * should follow this pattern: a `team_id` column plus the same RLS policy.
 *
 * RLS: rows are only visible/writable when the transaction has declared its
 * tenant via `set_config('app.current_team_id', <uuid>, true)` (see
 * `tenantScope()` in lib/db.ts). With no tenant set, current_setting() yields
 * NULL, the comparison is NULL, and NO rows match -> fails closed.
 *
 * NOTE: Postgres does not apply RLS to roles that own the table or have
 * BYPASSRLS (Neon's default `neondb_owner` does). Policies only protect you
 * when tenant queries run as a restricted role - see README notes in the
 * hand-off message. Application code still filters by team_id explicitly.
 */
export const teamUsers = pgTable(
  "team_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamRole: teamRole("team_role").notNull().default("player"),
  },
  (t) => [
    uniqueIndex("team_users_team_user_idx").on(t.teamId, t.userId),
    index("team_users_user_idx").on(t.userId),
    pgPolicy("team_users_tenant_isolation", {
      as: "permissive",
      for: "all",
      using: sql`${t.teamId} = nullif(current_setting('app.current_team_id', true), '')::uuid`,
      withCheck: sql`${t.teamId} = nullif(current_setting('app.current_team_id', true), '')::uuid`,
    }),
  ],
).enableRLS();

/**
 * Team Roster / Players table (tenant-scoped by team_id).
 */
export const players = pgTable(
  "players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    jerseyNumber: integer("jersey_number"),
    position: text("position").notNull().default("Middenvelder"),
    role: text("role").notNull().default("Speler"),
    email: text("email"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("players_team_idx").on(t.teamId),
    pgPolicy("players_tenant_isolation", {
      as: "permissive",
      for: "all",
      using: sql`${t.teamId} = nullif(current_setting('app.current_team_id', true), '')::uuid`,
      withCheck: sql`${t.teamId} = nullif(current_setting('app.current_team_id', true), '')::uuid`,
    }),
  ],
).enableRLS();

/**
 * Single-use magic-link tokens. Only the SHA-256 hash is stored, so a leaked
 * database row can't be used to sign in. RLS is enabled with no policy, which
 * denies access to any restricted role by default.
 */
export const loginTokens = pgTable(
  "login_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("login_tokens_user_created_idx").on(t.userId, t.createdAt)],
).enableRLS();
