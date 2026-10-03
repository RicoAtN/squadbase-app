"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { teams, teamUsers, players } from "@/db/schema";
import { safeQuery } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export type SettingsState = { ok: boolean; message: string } | null;
export type PlayerState = { ok: boolean; message: string } | null;

const field = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/**
 * Verify that the current user is a manager of the given team.
 */
async function requireTeamManager(teamId: string) {
  const user = await getSessionUser();
  if (!user) return null;

  // Superadmin has access to manage any team
  if (user.globalRole === "superadmin") return { user, isManager: true };

  const check = await safeQuery((db) =>
    db
      .select({ id: teamUsers.id })
      .from(teamUsers)
      .where(
        and(
          eq(teamUsers.teamId, teamId),
          eq(teamUsers.userId, user.id),
          eq(teamUsers.teamRole, "manager"),
        ),
      )
      .limit(1),
  );

  if (check.ok && check.data.length > 0) {
    return { user, isManager: true };
  }
  return null;
}

/**
 * Update team branding and settings (Teamnaam, Clubkleuren, Logo Emoji, Motto, Home ground).
 */
export async function updateTeamSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const teamId = field(formData, "teamId");
  if (!teamId) return { ok: false, message: "Geen team ID opgegeven." };

  const auth = await requireTeamManager(teamId);
  if (!auth) return { ok: false, message: "Geen beheerderrechten voor dit team." };

  const teamName = field(formData, "teamName");
  const primaryColor = field(formData, "primaryColor") || "#059669";
  const logoEmoji = field(formData, "logoEmoji") || "⚽";
  const tagline = field(formData, "tagline");
  const description = field(formData, "description");
  const homeGround = field(formData, "homeGround");

  if (teamName.length < 2 || teamName.length > 80) {
    return { ok: false, message: "Teamnaam moet tussen de 2 en 80 karakters zijn." };
  }

  const result = await safeQuery(
    (db) =>
      db
        .update(teams)
        .set({
          name: teamName,
          themeSettings: {
            primary_color: primaryColor,
            logo_emoji: logoEmoji,
            tagline: tagline || undefined,
            description: description || undefined,
            home_ground: homeGround || undefined,
          },
        })
        .where(eq(teams.id, teamId)),
    { retries: 0 },
  );

  if (!result.ok) {
    return { ok: false, message: "Kon instellingen niet opslaan. Probeer opnieuw." };
  }

  revalidatePath("/");
  return { ok: true, message: "Team instellingen succesvol opgeslagen!" };
}

/**
 * Add a new player to the team roster.
 */
export async function addPlayer(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const teamId = field(formData, "teamId");
  if (!teamId) return { ok: false, message: "Geen team ID opgegeven." };

  const auth = await requireTeamManager(teamId);
  if (!auth) return { ok: false, message: "Geen beheerderrechten voor dit team." };

  const name = field(formData, "name");
  const rawJersey = field(formData, "jerseyNumber");
  const jerseyNumber = rawJersey ? parseInt(rawJersey, 10) : null;
  const position = field(formData, "position") || "Middenvelder";
  const role = field(formData, "role") || "Speler";
  const email = field(formData, "email") || null;

  if (name.length < 2 || name.length > 80) {
    return { ok: false, message: "Naam van de speler moet minimaal 2 karakters zijn." };
  }
  if (jerseyNumber !== null && (isNaN(jerseyNumber) || jerseyNumber < 1 || jerseyNumber > 99)) {
    return { ok: false, message: "Rugnummer moet tussen 1 en 99 zijn." };
  }

  const result = await safeQuery(
    (db) =>
      db.insert(players).values({
        teamId,
        name,
        jerseyNumber,
        position,
        role,
        email,
      }),
    { retries: 0 },
  );

  if (!result.ok) {
    return { ok: false, message: "Kon speler niet toevoegen. Probeer opnieuw." };
  }

  revalidatePath("/");
  return { ok: true, message: `Speler '${name}' succesvol toegevoegd aan de selectie!` };
}

/**
 * Edit an existing player in the roster.
 */
export async function updatePlayer(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const teamId = field(formData, "teamId");
  const playerId = field(formData, "playerId");
  if (!teamId || !playerId) return { ok: false, message: "Ongeldige gegevens." };

  const auth = await requireTeamManager(teamId);
  if (!auth) return { ok: false, message: "Geen beheerderrechten voor dit team." };

  const name = field(formData, "name");
  const rawJersey = field(formData, "jerseyNumber");
  const jerseyNumber = rawJersey ? parseInt(rawJersey, 10) : null;
  const position = field(formData, "position") || "Middenvelder";
  const role = field(formData, "role") || "Speler";
  const email = field(formData, "email") || null;

  if (name.length < 2 || name.length > 80) {
    return { ok: false, message: "Naam moet minimaal 2 karakters zijn." };
  }
  if (jerseyNumber !== null && (isNaN(jerseyNumber) || jerseyNumber < 1 || jerseyNumber > 99)) {
    return { ok: false, message: "Rugnummer moet tussen 1 en 99 zijn." };
  }

  const result = await safeQuery(
    (db) =>
      db
        .update(players)
        .set({
          name,
          jerseyNumber,
          position,
          role,
          email,
        })
        .where(and(eq(players.id, playerId), eq(players.teamId, teamId))),
    { retries: 0 },
  );

  if (!result.ok) {
    return { ok: false, message: "Kon speler niet bijwerken. Probeer opnieuw." };
  }

  revalidatePath("/");
  return { ok: true, message: `Gegevens van '${name}' succesvol bijgewerkt!` };
}

/**
 * Delete a player from the roster.
 */
export async function deletePlayer(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const teamId = field(formData, "teamId");
  const playerId = field(formData, "playerId");
  if (!teamId || !playerId) return { ok: false, message: "Ongeldige gegevens." };

  const auth = await requireTeamManager(teamId);
  if (!auth) return { ok: false, message: "Geen beheerderrechten voor dit team." };

  const result = await safeQuery(
    (db) =>
      db
        .delete(players)
        .where(and(eq(players.id, playerId), eq(players.teamId, teamId))),
    { retries: 0 },
  );

  if (!result.ok) {
    return { ok: false, message: "Kon speler niet verwijderen. Probeer opnieuw." };
  }

  revalidatePath("/");
  return { ok: true, message: "Speler succesvol uit de selectie verwijderd." };
}
