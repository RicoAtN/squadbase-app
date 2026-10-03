ALTER TABLE "team_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "theme_settings" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "teams" SET "theme_settings" = "theme_config";--> statement-breakpoint
CREATE POLICY "team_users_tenant_isolation" ON "team_users" AS PERMISSIVE FOR ALL TO public USING ("team_users"."team_id" = nullif(current_setting('app.current_team_id', true), '')::uuid) WITH CHECK ("team_users"."team_id" = nullif(current_setting('app.current_team_id', true), '')::uuid);