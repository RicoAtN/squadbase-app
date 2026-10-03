import type { Metadata } from "next";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { safeQuery } from "@/lib/db";
import { teams, players } from "@/db/schema";
import { appUrl } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const slug = decodeURIComponent(subdomain).toLowerCase();

  const result = await safeQuery((db) =>
    db.select().from(teams).where(eq(teams.subdomain, slug)).limit(1),
  );

  if (!result.ok || !result.data.length) {
    return { title: "Team niet gevonden · Squadbase" };
  }

  const team = result.data[0];
  return {
    title: `${team.name} · Squadbase`,
    description: team.themeSettings?.tagline || `Officiële teampagina van ${team.name} op Squadbase.nl`,
  };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const slug = decodeURIComponent(subdomain).toLowerCase();

  // 1. Fetch team
  const result = await safeQuery((db) =>
    db.select().from(teams).where(eq(teams.subdomain, slug)).limit(1),
  );

  if (!result.ok) throw new Error(`team lookup failed: ${result.error}`);

  const team = result.data[0];
  if (!team) notFound();

  // If team is inactive/archived
  if (!team.isActive) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center bg-slate-50">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 text-4xl font-bold">
          📦
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{team.name}</h1>
        <p className="text-sm text-slate-600 max-w-sm">
          Deze teampagina is momenteel niet actief of gearchiveerd door de beheerder.
        </p>
      </main>
    );
  }

  // 2. Fetch players
  const playersResult = await safeQuery((db) =>
    db
      .select({
        id: players.id,
        name: players.name,
        jerseyNumber: players.jerseyNumber,
        position: players.position,
        role: players.role,
        isActive: players.isActive,
      })
      .from(players)
      .where(eq(players.teamId, team.id))
      .orderBy(asc(players.jerseyNumber), asc(players.name)),
  );

  const squad = playersResult.ok ? playersResult.data : [];
  const primaryColor = team.themeSettings?.primary_color || "#059669";
  const logoEmoji = team.themeSettings?.logo_emoji || "⚽";
  const tagline = team.themeSettings?.tagline;
  const homeGround = team.themeSettings?.home_ground;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-5 sm:px-8 py-3.5 shadow-2xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl shadow-2xs">
              {logoEmoji}
            </span>
            <div>
              <span className="text-base font-black tracking-tight text-slate-950 block leading-tight">
                {team.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {team.subdomain}.squadbase.nl
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#selectie"
              className="hidden sm:inline-block text-xs font-semibold text-slate-600 hover:text-slate-900 transition px-2 py-1"
            >
              Selectie
            </a>
            <a
              href="#info"
              className="hidden sm:inline-block text-xs font-semibold text-slate-600 hover:text-slate-900 transition px-2 py-1"
            >
              Team Info
            </a>
            <a
              href={appUrl()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition"
            >
              <span>Inloggen / Team CMS</span>
              <span aria-hidden>&rarr;</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with dynamic brand gradient */}
      <section
        className="relative px-6 py-16 sm:py-24 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-xs px-3 py-1 text-xs font-bold text-white shadow-2xs">
              <span>{logoEmoji}</span>
              <span>Officiële Teampagina</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-white">
              {team.name}
            </h1>

            {tagline ? (
              <p className="text-base sm:text-lg text-white/90 font-medium leading-relaxed">
                &ldquo;{tagline}&rdquo;
              </p>
            ) : (
              <p className="text-sm sm:text-base text-white/80 font-medium">
                Welkom op de officiële teampagina van {team.name} op Squadbase.
              </p>
            )}

            {/* Quick Stat Chips */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-black/25 backdrop-blur-xs px-3 py-1.5 text-xs font-bold text-white border border-white/10">
                <span>👥</span>
                <span>{squad.length} {squad.length === 1 ? "Speler" : "Spelers"}</span>
              </div>

              {homeGround && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-black/25 backdrop-blur-xs px-3 py-1.5 text-xs font-bold text-white border border-white/10">
                  <span>📍</span>
                  <span>{homeGround}</span>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 rounded-xl bg-black/25 backdrop-blur-xs px-3 py-1.5 text-xs font-bold text-white border border-white/10">
                <span>🏆</span>
                <span>Seizoen 2026/2027</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Content Container */}
      <main className="flex-1 mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-12 w-full">
        {/* Module: Selectie & Spelers */}
        <section id="selectie" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Selectie & Spelers
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Spelers en stafleden van {team.name}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {squad.length} Spelers
            </span>
          </div>

          {squad.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {squad.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl bg-white p-4 shadow-2xs ring-1 ring-slate-200/80 hover:shadow-md transition-shadow flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black text-sm text-white shadow-xs font-mono"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {p.jerseyNumber !== null ? p.jerseyNumber : "—"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">
                        {p.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {p.position}
                      </span>
                    </div>
                  </div>

                  {p.role !== "Speler" && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {p.role === "Aanvoerder" ? "© Aanvoerder" : p.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center space-y-2">
              <span className="text-3xl">👥</span>
              <h3 className="text-sm font-bold text-slate-800">
                Selectie wordt binnenkort bekendgemaakt
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                De teammanager kan via het Team CMS eenvoudig spelers toevoegen en rugnummers toewijzen.
              </p>
            </div>
          )}
        </section>

        {/* Module: Team Informatie */}
        <section id="info" className="rounded-3xl bg-white p-6 sm:p-8 shadow-2xs ring-1 ring-slate-200/80 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Over {team.name}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-400 block text-[10px]">
                Locatie & Wedstrijden
              </span>
              <p>
                {homeGround
                  ? `Thuisbasis: ${homeGround}. Kom gezellig kijken langs de lijn!`
                  : "Amateurvoetbalteam geregistreerd op Squadbase."}
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-400 block text-[10px]">
                Team Beheer
              </span>
              <p>
                Teamleden en staf kunnen inloggen op het afgeschermde Team CMS voor aanwezigheid, kasboeken en boetepot.
              </p>
              <a
                href={appUrl()}
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition"
              >
                <span>Naar Team CMS</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} {team.name} · Powered by{" "}
          <a
            href={process.env.NODE_ENV === "production" ? "https://squadbase.nl" : "http://localhost:3000"}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-slate-700 hover:text-emerald-600 transition"
          >
            Squadbase.nl
          </a>
        </p>
      </footer>
    </div>
  );
}
