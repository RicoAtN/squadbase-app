CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"name" text NOT NULL,
	"jersey_number" integer,
	"position" text DEFAULT 'Middenvelder' NOT NULL,
	"role" text DEFAULT 'Speler' NOT NULL,
	"email" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "players_team_idx" ON "players" USING btree ("team_id");--> statement-breakpoint
CREATE POLICY "players_tenant_isolation" ON "players" AS PERMISSIVE FOR ALL TO public USING ("players"."team_id" = nullif(current_setting('app.current_team_id', true), '')::uuid) WITH CHECK ("players"."team_id" = nullif(current_setting('app.current_team_id', true), '')::uuid);