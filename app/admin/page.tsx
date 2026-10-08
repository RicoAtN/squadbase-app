import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { teams, teamUsers, users } from "@/db/schema";
import { safeQuery } from "@/lib/db";
import { getSessionUser, requireSuperadmin } from "@/lib/session";
import { AdminDashboardView } from "./teams-table";
import { appUrl } from "@/lib/auth";
import { logout } from "@/app/app/login/actions";
import { SquadbaseLogo } from "@/components/squadbase-logo";
import Image from "next/image";

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
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center bg-navy-950 text-slate-100">
        <div className="rounded-2xl bg-red-950/80 border border-red-800/80 p-4 text-red-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Geen toegang (403)</h1>
        <p className="text-slate-400 max-w-sm">
          Ingelogd als <span className="font-semibold text-slate-200">{user.email}</span>. Dit account heeft geen beheerderrechten.
        </p>
        <div className="flex gap-3">
          <a
            href={appUrl()}
            className="rounded-xl border border-navy-700 bg-navy-900 px-4 py-2 text-sm font-medium text-gold-300 hover:bg-navy-800 transition"
          >
            Naar Team Beheer
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-xl bg-navy-800 border border-navy-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-navy-700 hover:text-white transition"
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
    <div className="min-h-screen bg-navy-950 text-slate-100 pb-8">
      {/* Top Admin Navbar (Compact) */}
      <header className="sticky top-0 z-10 border-b border-navy-800/80 bg-navy-900/95 backdrop-blur-md px-5 sm:px-8 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <SquadbaseLogo size="sm" variant="light" />
            <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-300">
              Super Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 md:inline">
              Ingelogd als <strong className="text-slate-200">{admin.email}</strong>
            </span>
            <a
              href={appUrl()}
              className="rounded-lg border border-navy-700 bg-navy-800/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-navy-700 hover:border-gold-500/40 hover:text-white transition"
            >
              Team CMS &rarr;
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

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Compact KPI Stats Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-navy-900/90 p-3.5 border border-navy-800/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Totaal Teams
              </span>
              <span className="text-xl font-black text-white leading-tight">
                {allTeams.length}
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 border border-navy-700/80 p-1 text-gold-400 font-bold text-xs">
              <Image src="/logo.png" alt="Teams" width={20} height={20} className="object-contain" />
            </div>
          </div>

          <div className="rounded-xl bg-navy-900/90 p-3.5 border border-navy-800/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400 block">
                Actieve Teams
              </span>
              <span className="text-xl font-black text-gold-400 leading-tight">
                {activeTeamsCount}
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-gold-400 border border-gold-500/30 font-bold text-xs">
              ✓
            </div>
          </div>

          <div className="rounded-xl bg-navy-900/90 p-3.5 border border-navy-800/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Gebruikers
              </span>
              <span className="text-xl font-black text-white leading-tight">
                {allUsers.length}
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-purple-300 border border-navy-700/80 font-bold text-xs">
              👥
            </div>
          </div>

          <div className="rounded-xl bg-navy-900/90 p-3.5 border border-navy-800/80 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Domein Routing
              </span>
              <span className="text-xs font-bold text-gold-300 leading-tight block">
                *.squadbase.nl
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-blue-300 border border-navy-700/80 font-bold text-xs">
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
