import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const globalRole = pgEnum("global_role", ["user", "superadmin"]);
export const teamRole = pgEnum("team_role", ["manager", "player"]);

export type ThemeConfig = {
  primaryColor?: string;
  logoUrl?: string;
};

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  themeConfig: jsonb("theme_config").$type<ThemeConfig>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  globalRole: globalRole("global_role").notNull().default("user"),
});

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
    // A user can only have one membership per team.
    uniqueIndex("team_users_team_user_idx").on(t.teamId, t.userId),
    // Tenant-scoped lookups ("which teams is this user in?").
    index("team_users_user_idx").on(t.userId),
  ],
);
