"use server";

import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeQuery } from "@/lib/db";
import { requireSuperadmin } from "@/lib/session";
import { teams, teamUsers, users, loginTokens } from "@/db/schema";
import { newToken, INVITE_TOKEN_TTL_MINUTES, LOGIN_TOKEN_TTL_MINUTES, appUrl } from "@/lib/auth";
import { sendLoginEmail, sendTeamInviteEmail } from "@/lib/mail";

export type ProvisionState = { ok: boolean; message: string; inviteLink?: string } | null;
export type UpdateTeamState = { ok: boolean; message: string } | null;
export type ArchiveState = { ok: boolean; message: string } | null;
export type DeleteState = { ok: boolean; message: string } | null;
export type InviteState = { ok: boolean; message: string; link?: string } | null;

const SUBDOMAIN = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESERVED = new Set([
  "www", "admin", "app", "api", "mail", "smtp", "ftp", "static", "assets",
  "cdn", "status", "support", "help", "blog", "docs", "dev", "staging",
]);

const field = (fd: FormData, key: string) =>
  String(fd.get(key) ?? "").trim();

/**
 * Super Admin only: create a team, assign manager, and send the welcome invite email automatically (valid 7 days).
 */
export async function provisionTeam(
  _prev: ProvisionState,
  formData: FormData,
): Promise<ProvisionState> {
  const admin = await requireSuperadmin();
  if (!admin) return { ok: false, message: "Geen beheerderrechten." };

  const teamName = field(formData, "teamName");
  const subdomain = field(formData, "subdomain").toLowerCase();
  const managerEmail = field(formData, "managerEmail").toLowerCase();
  const managerName = field(formData, "managerName");

  if (teamName.length < 2 || teamName.length > 80) {
    return { ok: false, message: "Teamnaam moet 2-80 karakters zijn." };
  }
  if (!SUBDOMAIN.test(subdomain) || RESERVED.has(subdomain)) {
    return { ok: false, message: "Ongeldig of gereserveerd subdomein." };
  }
  if (!EMAIL.test(managerEmail) || managerEmail.length > 254) {
    return { ok: false, message: "Ongeldig e-mailadres voor de manager." };
  }
  if (managerName.length < 2 || managerName.length > 80) {
    return { ok: false, message: "Managernaam moet 2-80 karakters zijn." };
  }

  const result = await safeQuery(
    (db) =>
      db.execute(sql`
        with new_team as (
          insert into teams (name, subdomain)
          values (${teamName}, ${subdomain})
          returning id
        ),
        manager as (
          insert into users (email, name)
          values (${managerEmail}, ${managerName})
          on conflict (email) do update set name = excluded.name
          returning id
        ),
        new_tu as (
          insert into team_users (team_id, user_id, team_role)
          select new_team.id, manager.id, 'manager'::team_role
          from new_team, manager
          returning team_id, user_id
        )
        select new_team.id as team_id, manager.id as manager_id
        from new_team, manager
      `),
    { retries: 0 },
  );

  if (!result.ok) {
    if (result.error === "query_failed" && result.code === "23505") {
      return { ok: false, message: "Dit subdomein is al in gebruik." };
    }
    return { ok: false, message: "Kon het team niet aanmaken. Probeer het opnieuw." };
  }

  // Generate and send invite token automatically (valid for 7 days)
  let inviteLink: string | undefined;
  try {
    const rawRows = result.data as unknown as Array<{ team_id: string; manager_id: string }>;
    if (rawRows && rawRows[0]) {
      const managerId = rawRows[0].manager_id;
      const { token, hash } = newToken();
      const expiresAt = new Date(Date.now() + INVITE_TOKEN_TTL_MINUTES * 60 * 1000);

      await safeQuery((db) =>
        db.insert(loginTokens).values({
          userId: managerId,
          tokenHash: hash,
          expiresAt,
        }),
      );

      inviteLink = `${appUrl()}/login/verify?token=${token}`;
      await sendTeamInviteEmail({
        to: managerEmail,
        managerName,
        teamName,
        subdomain,
        link: inviteLink,
      });
    }
  } catch (err) {
    console.error("Error creating invite token on provision:", err);
  }

  revalidatePath("/");
  return {
    ok: true,
    message: `Team '${teamName}' aangemaakt en uitnodiging verzonden naar ${managerEmail}!`,
    inviteLink,
  };
}

/**
 * Super Admin only: Resend invite / magic link to a team manager (valid 7 days).
 */
export async function resendTeamInvite(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const admin = await requireSuperadmin();
  if (!admin) return { ok: false, message: "Geen beheerderrechten." };

  const teamId = field(formData, "teamId");
  if (!teamId) return { ok: false, message: "Geen team ID opgegeven." };

  const teamData = await safeQuery((db) =>
    db
      .select({
        teamId: teams.id,
        teamName: teams.name,
        subdomain: teams.subdomain,
        userId: users.id,
        managerName: users.name,
        managerEmail: users.email,
      })
      .from(teams)
      .innerJoin(teamUsers, eq(teamUsers.teamId, teams.id))
      .innerJoin(users, eq(users.id, teamUsers.userId))
      .where(and(eq(teams.id, teamId), eq(teamUsers.teamRole, "manager")))
      .limit(1),
  );

  if (!teamData.ok || !teamData.data.length) {
    return { ok: false, message: "Geen actieve manager gevonden voor dit team." };
  }

  const { teamName, subdomain, userId, managerName, managerEmail } = teamData.data[0];

  const { token, hash } = newToken();
  const expiresAt = new Date(Date.now() + INVITE_TOKEN_TTL_MINUTES * 60 * 1000);

  await safeQuery((db) =>
    db.insert(loginTokens).values({
      userId,
      tokenHash: hash,
      expiresAt,
    }),
  );

  const link = `${appUrl()}/login/verify?token=${token}`;
  await sendTeamInviteEmail({
    to: managerEmail,
    managerName,
    teamName,
    subdomain,
    link,
  });

  return {
    ok: true,
    message: `Uitnodigingsmail succesvol verzonden naar ${managerEmail}! (7 dagen geldig)`,
    link,
  };
}

/**
 * Super Admin only: Send login link directly to a platform user (valid 24 hours).
 */
export async function sendUserLoginLink(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const admin = await requireSuperadmin();
  if (!admin) return { ok: false, message: "Geen beheerderrechten." };

  const userId = field(formData, "userId");
  if (!userId) return { ok: false, message: "Geen gebruiker ID opgegeven." };

  const userData = await safeQuery((db) =>
    db.select().from(users).where(eq(users.id, userId)).limit(1),
  );

  if (!userData.ok || !userData.data.length) {
    return { ok: false, message: "Gebruiker niet gevonden." };
  }

  const user = userData.data[0];
  const { token, hash } = newToken();
  const expiresAt = new Date(Date.now() + LOGIN_TOKEN_TTL_MINUTES * 60 * 1000);

  await safeQuery((db) =>
    db.insert(loginTokens).values({
      userId: user.id,
      tokenHash: hash,
      expiresAt,
    }),
  );

  const link = `${appUrl()}/login/verify?token=${token}`;
  await sendLoginEmail(user.email, link);

  return {
    ok: true,
    message: `Inloglink succesvol verzonden naar ${user.email}! (24 uur geldig)`,
    link,
  };
}

/**
 * Super Admin only: update team details and manager assignment atomically.
 */
export async function updateTeam(
  _prev: UpdateTeamState,
  formData: FormData,
): Promise<UpdateTeamState> {
  const admin = await requireSuperadmin();
  if (!admin) return { ok: false, message: "Geen beheerderrechten." };

  const teamId = field(formData, "teamId");
  const teamName = field(formData, "teamName");
  const subdomain = field(formData, "subdomain").toLowerCase();
  const managerEmail = field(formData, "managerEmail").toLowerCase();
  const managerName = field(formData, "managerName");
  const isActive = formData.get("isActive") === "true";

  if (!teamId) {
    return { ok: false, message: "Ongeldig team ID." };
  }
  if (teamName.length < 2 || teamName.length > 80) {
    return { ok: false, message: "Teamnaam moet 2-80 karakters zijn." };
  }
  if (!SUBDOMAIN.test(subdomain) || RESERVED.has(subdomain)) {
    return { ok: false, message: "Ongeldig of gereserveerd subdomein." };
  }
  if (!EMAIL.test(managerEmail) || managerEmail.length > 254) {
    return { ok: false, message: "Ongeldig manager e-mailadres." };
  }
  if (managerName.length < 2 || managerName.length > 80) {
    return { ok: false, message: "Managernaam moet 2-80 karakters zijn." };
  }

  const result = await safeQuery(
    (db) =>
      db.execute(sql`
        with updated_team as (
          update teams
          set name = ${teamName}, subdomain = ${subdomain}, is_active = ${isActive}
          where id = ${teamId}::uuid
          returning id
        ),
        manager as (
          insert into users (email, name)
          values (${managerEmail}, ${managerName})
          on conflict (email) do update set name = ${managerName}
          returning id
        ),
        del_old_manager as (
          delete from team_users
          where team_id = ${teamId}::uuid and team_role = 'manager'
        )
        insert into team_users (team_id, user_id, team_role)
        select ${teamId}::uuid, manager.id, 'manager'::team_role
        from manager
        on conflict (team_id, user_id) do update set team_role = 'manager'
        returning team_id
      `),
    { retries: 0 },
  );

  if (!result.ok) {
    if (result.error === "query_failed" && result.code === "23505") {
      return { ok: false, message: "Dit subdomein is al bezet door een ander team." };
    }
    return { ok: false, message: "Kon gegevens niet bijwerken. Probeer het opnieuw." };
  }

  revalidatePath("/");
  return { ok: true, message: `Team '${teamName}' is succesvol bijgewerkt!` };
}

/**
 * Super Admin only: Archive a team (soft delete: sets is_active = false, disables subdomain & login).
 */
export async function archiveTeam(
  _prev: ArchiveState,
  formData: FormData,
): Promise<ArchiveState> {
  const admin = await requireSuperadmin();
  if (!admin) return { ok: false, message: "Geen beheerderrechten." };

  const teamId = field(formData, "teamId");
  if (!teamId) return { ok: false, message: "Ongeldig team ID." };

  const result = await safeQuery(
    (db) =>
      db.execute(sql`update teams set is_active = false where id = ${teamId}::uuid`),
    { retries: 0 },
  );

  if (!result.ok) {
    return { ok: false, message: "Kon team niet archiveren. Probeer het opnieuw." };
  }

  revalidatePath("/");
  return { ok: true, message: "Team is succesvol gearchiveerd." };
}

/**
 * Super Admin only: Restore a team from archive back into production (sets is_active = true).
 */
export async function restoreTeam(
  _prev: ArchiveState,
  formData: FormData,
): Promise<ArchiveState> {
  const admin = await requireSuperadmin();
  if (!admin) return { ok: false, message: "Geen beheerderrechten." };

  const teamId = field(formData, "teamId");
  if (!teamId) return { ok: false, message: "Ongeldig team ID." };

  const result = await safeQuery(
    (db) =>
      db.execute(sql`update teams set is_active = true where id = ${teamId}::uuid`),
    { retries: 0 },
  );

  if (!result.ok) {
    return { ok: false, message: "Kon team niet herstellen. Probeer het opnieuw." };
  }

  revalidatePath("/");
  return { ok: true, message: "Team is hersteld en weer live in productie!" };
}

/**
 * Super Admin only: delete a team permanently from the database.
 */
export async function deleteTeam(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const admin = await requireSuperadmin();
  if (!admin) return { ok: false, message: "Geen beheerderrechten." };

  const teamId = field(formData, "teamId");
  if (!teamId) return { ok: false, message: "Ongeldig team ID." };

  const result = await safeQuery(
    (db) => db.execute(sql`delete from teams where id = ${teamId}::uuid`),
    { retries: 0 },
  );

  if (!result.ok) {
    return { ok: false, message: "Kon het team niet definitief verwijderen. Probeer het opnieuw." };
  }

  revalidatePath("/");
  return { ok: true, message: "Team is definitief verwijderd uit de database." };
}

/**
 * Super Admin only: delete a platform user.
 */
export async function deleteUser(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const admin = await requireSuperadmin();
  if (!admin) return { ok: false, message: "Geen beheerderrechten." };

  const userId = field(formData, "userId");
  if (!userId) return { ok: false, message: "Ongeldig gebruiker ID." };

  if (userId === admin.id) {
    return { ok: false, message: "Je kunt je eigen superadmin account niet verwijderen." };
  }

  const result = await safeQuery(
    (db) => db.execute(sql`delete from users where id = ${userId}::uuid`),
    { retries: 0 },
  );

  if (!result.ok) {
    return { ok: false, message: "Kon de gebruiker niet verwijderen. Probeer het opnieuw." };
  }

  revalidatePath("/");
  return { ok: true, message: "Gebruiker is succesvol verwijderd." };
}
