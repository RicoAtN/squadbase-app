import type { Metadata } from "next";
import { eq, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { teams, teamUsers, players } from "@/db/schema";
import { safeQuery } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { logout } from "./login/actions";
import { adminUrl } from "@/lib/auth";
import { TeamCmsView } from "./team-cms-view";

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
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-2xl">
            ⚽
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Geen team gekoppeld</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ingelogd als <strong className="text-slate-800">{user.email}</strong>. Er is nog geen team aan je account gekoppeld door de platformbeheerder.
          </p>
          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
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
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 text-3xl font-bold">
            📦
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Team is Gearchiveerd</h1>
          <p className="mt-2 text-sm text-slate-600">
            Het team <strong className="text-slate-900">{team.name}</strong> is momenteel gedeactiveerd of in het archief geplaatst door de platformbeheerder.
          </p>
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200 text-left space-y-1">
            <p>• De openbare website en het CMS zijn tijdelijk uitgeschakeld.</p>
            <p>• Alle teamdata en kasboeken blijven veilig bewaard.</p>
          </div>
          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
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
    <div className="min-h-screen bg-slate-100/70 pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-5 sm:px-8 py-3 shadow-2xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tight text-emerald-950">
              ⚽ SQUADBASE
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Team Beheer
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 md:inline">
              Coach: <strong className="text-slate-800">{user.name}</strong> ({user.email})
            </span>
            <a
              href={teamUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition inline-flex items-center gap-1"
            >
              <span>Teampagina</span>
              <span>&rarr;</span>
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition"
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
