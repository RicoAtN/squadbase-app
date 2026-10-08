import type { Metadata } from "next";
import { eq, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { teams, teamUsers, players } from "@/db/schema";
import { safeQuery } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { logout } from "./login/actions";
import { adminUrl } from "@/lib/auth";
import { TeamCmsView } from "./team-cms-view";
import { SquadbaseLogo } from "@/components/squadbase-logo";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Team CMS · Squadbase",
  robots: { index: false, follow: false },
};

export default async function TeamAdminDashboard() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  // If the Super Admin visits app.squadbase.nl, redirect directly to their admin dashboard
  if (user.globalRole === "superadmin") {
    redirect(adminUrl());
  }

  // 1. Fetch the 1 team linked to this Team Admin
  const teamResult = await safeQuery((db) =>
    db
      .select({
        id: teams.id,
        name: teams.name,
        subdomain: teams.subdomain,
        isActive: teams.isActive,
        themeSettings: teams.themeSettings,
        createdAt: teams.createdAt,
        role: teamUsers.teamRole,
      })
      .from(teamUsers)
      .innerJoin(teams, eq(teams.id, teamUsers.teamId))
      .where(eq(teamUsers.userId, user.id))
      .limit(1),
  );

  const team = teamResult.ok ? teamResult.data[0] : null;

  // If no team is assigned to this user
  if (!team) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-navy-950 text-center text-slate-100">
        <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-navy-800 p-8 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-950 border border-navy-800 p-2 shadow-xs">
            <SquadbaseLogo size="md" variant="light" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-white">Geen team gekoppeld</h1>
          <p className="mt-2 text-sm text-slate-400">
            Ingelogd als <strong className="text-slate-200">{user.email}</strong>. Er is nog geen team aan je account gekoppeld door de platformbeheerder.
          </p>
          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="rounded-xl bg-navy-800 border border-navy-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-navy-700 hover:text-white transition"
            >
              Uitloggen
            </button>
          </form>
        </div>
      </main>
    );
  }

  // If team is archived / inactive
  if (!team.isActive) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-navy-950 text-center text-slate-100">
        <div className="w-full max-w-md rounded-3xl bg-navy-900 border border-navy-800 p-8 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-950/80 border border-amber-700/50 text-amber-300 text-3xl font-bold">
            📦
          </div>
          <h1 className="mt-4 text-xl font-bold text-white">Team is Gearchiveerd</h1>
          <p className="mt-2 text-sm text-slate-400">
            Het team <strong className="text-white">{team.name}</strong> is momenteel gedeactiveerd of in het archief geplaatst door de platformbeheerder.
          </p>
          <div className="mt-4 rounded-xl bg-amber-950/50 p-3 text-xs text-amber-200 border border-amber-800/60 text-left space-y-1">
            <p>• De openbare website en het CMS zijn tijdelijk uitgeschakeld.</p>
            <p>• Alle teamdata en kasboeken blijven veilig bewaard.</p>
          </div>
          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="rounded-xl bg-navy-800 border border-navy-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-navy-700 hover:text-white transition"
            >
              Uitloggen
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 2. Fetch the players in this team's roster
  const playersResult = await safeQuery((db) =>
    db
      .select({
        id: players.id,
        name: players.name,
        jerseyNumber: players.jerseyNumber,
        position: players.position,
        role: players.role,
        email: players.email,
        isActive: players.isActive,
      })
      .from(players)
      .where(eq(players.teamId, team.id))
      .orderBy(asc(players.jerseyNumber), asc(players.name)),
  );

  const squadPlayers = playersResult.ok ? playersResult.data : [];

  const teamUrl =
    process.env.NODE_ENV === "production"
      ? `https://${team.subdomain}.squadbase.nl`
      : `http://${team.subdomain}.localhost:3000`;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-10 border-b border-navy-800/80 bg-navy-900/95 backdrop-blur-md px-5 sm:px-8 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <SquadbaseLogo size="sm" variant="light" />
            <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-300">
              Team Beheer
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 md:inline">
              Coach: <strong className="text-slate-200">{user.name}</strong> ({user.email})
            </span>
            <a
              href={teamUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-navy-700 bg-navy-800/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-navy-700 hover:border-gold-500/40 hover:text-white transition inline-flex items-center gap-1"
            >
              <span>Teampagina</span>
              <span>&rarr;</span>
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg bg-navy-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-navy-700 hover:text-white border border-navy-700/60 transition"
              >
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <TeamCmsView
          team={team}
          players={squadPlayers}
          managerName={user.name}
          managerEmail={user.email}
        />
      </main>
    </div>
  );
}
