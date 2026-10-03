import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { teams, teamUsers, users } from "@/db/schema";
import { safeQuery } from "@/lib/db";
import { getSessionUser, requireSuperadmin } from "@/lib/session";
import { AdminDashboardView } from "./teams-table";
import { appUrl } from "@/lib/auth";
import { logout } from "@/app/app/login/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Super Admin Dashboard · Squadbase",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getSessionUser();
  const admin = await requireSuperadmin();

  if (!user) {
    redirect("/login");
  }

  if (!admin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center bg-slate-50">
        <div className="rounded-full bg-red-100 p-3 text-red-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Geen toegang (403)</h1>
        <p className="text-slate-600 max-w-sm">
          Ingelogd als <span className="font-semibold text-slate-800">{user.email}</span>. Dit account heeft geen beheerderrechten.
        </p>
        <div className="flex gap-3">
          <a
            href={appUrl()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Naar Team Beheer
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
            >
              Uitloggen
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 1. Fetch all teams with their manager info
  const teamsData = await safeQuery((db) =>
    db
      .select({
        id: teams.id,
        name: teams.name,
        subdomain: teams.subdomain,
        isActive: teams.isActive,
        createdAt: teams.createdAt,
        managerName: users.name,
        managerEmail: users.email,
      })
      .from(teams)
      .leftJoin(teamUsers, eq(teamUsers.teamId, teams.id))
      .leftJoin(users, eq(users.id, teamUsers.userId))
      .orderBy(desc(teams.createdAt)),
  );

  // 2. Fetch all registered users with their assigned team
  const usersData = await safeQuery((db) =>
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        globalRole: users.globalRole,
        teamName: teams.name,
        teamSubdomain: teams.subdomain,
        teamRole: teamUsers.teamRole,
      })
      .from(users)
      .leftJoin(teamUsers, eq(teamUsers.userId, users.id))
      .leftJoin(teams, eq(teams.id, teamUsers.teamId))
      .orderBy(users.name),
  );

  const allTeams = teamsData.ok ? teamsData.data : [];
  const allUsers = usersData.ok ? usersData.data : [];
  const activeTeamsCount = allTeams.filter((t) => t.isActive).length;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-8">
      {/* Top Admin Navbar (Compact) */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-5 sm:px-8 py-3 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tight text-emerald-950">
              ⚽ SQUADBASE
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Super Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 md:inline">
              Ingelogd als <strong className="text-slate-800">{admin.email}</strong>
            </span>
            <a
              href={appUrl()}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
            >
              Team CMS &rarr;
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

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Compact KPI Stats Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white p-3.5 shadow-2xs ring-1 ring-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Totaal Teams
              </span>
              <span className="text-xl font-black text-slate-900 leading-tight">
                {allTeams.length}
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-bold text-xs">
              ⚽
            </div>
          </div>

          <div className="rounded-xl bg-white p-3.5 shadow-2xs ring-1 ring-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                Actieve Teams
              </span>
              <span className="text-xl font-black text-emerald-700 leading-tight">
                {activeTeamsCount}
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">
              ✓
            </div>
          </div>

          <div className="rounded-xl bg-white p-3.5 shadow-2xs ring-1 ring-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Gebruikers
              </span>
              <span className="text-xl font-black text-slate-900 leading-tight">
                {allUsers.length}
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700 font-bold text-xs">
              👥
            </div>
          </div>

          <div className="rounded-xl bg-white p-3.5 shadow-2xs ring-1 ring-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Domein Routing
              </span>
              <span className="text-xs font-bold text-slate-800 leading-tight block">
                *.squadbase.nl
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
              🌐
            </div>
          </div>
        </section>

        {/* Unified Tabbed Dashboard View (Zero-Scroll on standard screens) */}
        <section className="w-full">
          <AdminDashboardView teams={allTeams} users={allUsers} currentUserId={admin.id} />
        </section>
      </main>
    </div>
  );
}
