"use client";

import { useState, useActionState } from "react";
import {
  updateTeamSettings,
  addPlayer,
  updatePlayer,
  deletePlayer,
  type SettingsState,
  type PlayerState,
} from "./team-actions";
import type { ThemeSettings } from "@/db/schema";

export type TeamCmsPlayer = {
  id: string;
  name: string;
  jerseyNumber: number | null;
  position: string;
  role: string;
  email: string | null;
  isActive: boolean;
};

export type TeamCmsData = {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  themeSettings: ThemeSettings;
  createdAt: Date;
  role: string;
};

const inputStyle =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition";

const COLOR_PRESETS = [
  { name: "Emerald Groen", hex: "#059669" },
  { name: "Koninklijk Blauw", hex: "#2563eb" },
  { name: "Robijn Rood", hex: "#dc2626" },
  { name: "Klassiek Oranje", hex: "#ea580c" },
  { name: "Goud Geel", hex: "#d97706" },
  { name: "Paars", hex: "#7c3aed" },
  { name: "Nacht Zwart", hex: "#0f172a" },
  { name: "Bordeaux", hex: "#881337" },
];

const EMOJI_PRESETS = ["⚽", "🦁", "🦅", "⚡", "🔥", "🏆", "🛡️", "🐂", "🦈", "⭐"];

export function TeamCmsView({
  team,
  players,
  managerName,
  managerEmail,
}: {
  team: TeamCmsData;
  players: TeamCmsPlayer[];
  managerName: string;
  managerEmail: string;
}) {
  const [activeTab, setActiveTab] = useState<"roster" | "settings" | "fines">("roster");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<TeamCmsPlayer | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<TeamCmsPlayer | null>(null);

  const [selectedColor, setSelectedColor] = useState(
    team.themeSettings?.primary_color || "#059669",
  );
  const [selectedEmoji, setSelectedEmoji] = useState(
    team.themeSettings?.logo_emoji || "⚽",
  );

  const teamUrl =
    process.env.NODE_ENV === "production"
      ? `https://${team.subdomain}.squadbase.nl`
      : `http://${team.subdomain}.localhost:3000`;

  return (
    <div className="space-y-6">
      {/* 1. Team Banner Header */}
      <section
        className="rounded-3xl p-6 sm:p-8 text-white shadow-md transition-colors"
        style={{
          background: `linear-gradient(135deg, ${selectedColor} 0%, #0f172a 100%)`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xs text-3xl sm:text-4xl shadow-inner">
              {selectedEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Team CMS
                </span>
                <span className="text-xs text-white/80 font-mono">
                  {team.subdomain}.squadbase.nl
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                {team.name}
              </h1>
              {team.themeSettings?.tagline && (
                <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                  &ldquo;{team.themeSettings.tagline}&rdquo;
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <a
              href={teamUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-slate-50 transition"
            >
              <span>Publieke Website</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Quick KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-2xs ring-1 ring-slate-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Selectie
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {players.length}
          </div>
          <p className="text-[10px] text-slate-400">Spelers & staf geregistreerd</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-2xs ring-1 ring-slate-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
            Teamkas / Boetepot
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-700">
            € 0,00
          </div>
          <p className="text-[10px] text-slate-400">0 openstaande boetes</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-2xs ring-1 ring-slate-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Team Coach
          </span>
          <div className="mt-1 text-sm font-bold text-slate-900 truncate">
            {managerName}
          </div>
          <p className="text-[10px] text-slate-400 truncate">{managerEmail}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-2xs ring-1 ring-slate-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Clubkleur
          </span>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="h-5 w-5 rounded-full ring-2 ring-white shadow-xs"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="font-mono text-xs font-bold text-slate-700">
              {selectedColor}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Toegepast op openbare site</p>
        </div>
      </section>

      {/* 3. Main Navigation Tabs */}
      <div className="rounded-2xl bg-white shadow-xs ring-1 ring-slate-200/80 overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="inline-flex items-center rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab("roster")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "roster"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>👥 Selectie & Spelers</span>
              <span
                className={`rounded-full px-2 py-0.2 text-[11px] font-black ${
                  activeTab === "roster"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200/70 text-slate-600"
                }`}
              >
                {players.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "settings"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>⚙️ Team Branding & Info</span>
            </button>

            <button
              onClick={() => setActiveTab("fines")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "fines"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>💶 Boetepot & Kas</span>
            </button>
          </div>

          {activeTab === "roster" && (
            <button
              onClick={() => setIsAddingPlayer(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Speler Toevoegen
            </button>
          )}
        </div>

        {/* Tab Content 1: Roster */}
        {activeTab === "roster" && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Nr</th>
                  <th className="px-5 py-3">Speler</th>
                  <th className="px-5 py-3">Positie</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">E-mail</th>
                  <th className="px-5 py-3 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {players.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Jersey */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      {p.jerseyNumber !== null ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white shadow-2xs font-mono">
                          {p.jerseyNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300 font-mono">—</span>
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3 whitespace-nowrap font-bold text-slate-900 text-xs">
                      {p.name}
                    </td>

                    {/* Position */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {p.position}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      {p.role === "Aanvoerder" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          © Aanvoerder
                        </span>
                      ) : p.role === "Coach / Trainer" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          Coach
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">{p.role}</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {p.email || <span className="text-slate-300 italic">Geen account</span>}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingPlayer(p)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition"
                        >
                          <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Bewerken
                        </button>

                        <button
                          onClick={() => setDeletingPlayer(p)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1 text-xs font-bold text-red-700 shadow-2xs hover:bg-red-100 hover:border-red-300 transition"
                          title="Verwijderen"
                        >
                          <svg className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Verwijderen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {players.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-xs">
                      Nog geen spelers toegevoegd aan de selectie. Klik op &quot;Speler Toevoegen&quot; om de eerste speler aan te melden!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content 2: Settings & Branding */}
        {activeTab === "settings" && (
          <SettingsTabContent
            team={team}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedEmoji={selectedEmoji}
            setSelectedEmoji={setSelectedEmoji}
          />
        )}

        {/* Tab Content 3: Boetepot Preview */}
        {activeTab === "fines" && (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 text-3xl font-bold">
              💶
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Teamkas & Boetepot Module
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Houd eenvoudig teamregels, boetes per wedstrijd (te laat komen, foute panna, tas vergeten) en de actuele stand van de pot bij.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              ✓ Klaar voor configuratie
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddingPlayer && (
        <AddPlayerModal
          teamId={team.id}
          onClose={() => setIsAddingPlayer(false)}
        />
      )}

      {editingPlayer && (
        <EditPlayerModal
          teamId={team.id}
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
        />
      )}

      {deletingPlayer && (
        <DeletePlayerModal
          teamId={team.id}
          player={deletingPlayer}
          onClose={() => setDeletingPlayer(null)}
        />
      )}
    </div>
  );
}

function SettingsTabContent({
  team,
  selectedColor,
  setSelectedColor,
  selectedEmoji,
  setSelectedEmoji,
}: {
  team: TeamCmsData;
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  selectedEmoji: string;
  setSelectedEmoji: (e: string) => void;
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateTeamSettings,
    null,
  );

  return (
    <form action={action} className="p-6 sm:p-8 space-y-6 max-w-2xl">
      <input type="hidden" name="teamId" value={team.id} />
      <input type="hidden" name="primaryColor" value={selectedColor} />
      <input type="hidden" name="logoEmoji" value={selectedEmoji} />

      <div>
        <h3 className="text-base font-bold text-slate-900">
          Team Weergave & Branding
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Pas de clubkleuren, teamnaam en informatie aan voor de openbare teampagina.
        </p>
      </div>

      <div className="space-y-4">
        {/* Teamnaam */}
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Teamnaam
          <input
            name="teamName"
            defaultValue={team.name}
            required
            minLength={2}
            maxLength={80}
            className={inputStyle}
            placeholder="bijv. FC Cojones 3"
          />
        </label>

        {/* Subdomein (Locked with explanation) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Subdomein (Vaste URL)
          </label>
          <div className="mt-1.5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-500">
            <span className="font-mono font-bold text-slate-800">
              {team.subdomain}.squadbase.nl
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              🔒 Beveiligd
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Het subdomein is vastgelegd om gebroken links en WhatsApp-groepen te voorkomen. Vraag de Super Admin bij wijzigingen.
          </p>
        </div>

        {/* Clubkleur selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Clubkleur (Kleur van je team)
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setSelectedColor(c.hex)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  selectedColor.toLowerCase() === c.hex.toLowerCase()
                    ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Logo Emoji Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Team Logo / Mascotte
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedEmoji(emoji)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
                  selectedEmoji === emoji
                    ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-300 scale-105"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Tagline & Slogan */}
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Teammotto / Slogan
          <input
            name="tagline"
            defaultValue={team.themeSettings?.tagline ?? ""}
            maxLength={100}
            className={inputStyle}
            placeholder="bijv. De gezelligste selectie van de 4e klasse zaterdag"
          />
        </label>

        {/* Home ground */}
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Thuishonk / Sportpark
          <input
            name="homeGround"
            defaultValue={team.themeSettings?.home_ground ?? ""}
            maxLength={80}
            className={inputStyle}
            placeholder="bijv. Sportpark De Toekomst, Veld 2"
          />
        </label>
      </div>

      {state && (
        <div
          className={`rounded-xl p-3 text-xs font-medium ${
            state.ok
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="pt-2">
        <button
          disabled={pending}
          type="submit"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {pending ? "Opslaan..." : "Instellingen Opslaan"}
        </button>
      </div>
    </form>
  );
}

function AddPlayerModal({
  teamId,
  onClose,
}: {
  teamId: string;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<PlayerState, FormData>(
    async (prev, formData) => {
      const res = await addPlayer(prev, formData);
      if (res?.ok) {
        setTimeout(() => onClose(), 800);
      }
      return res;
    },
    null,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              ⚽
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nieuwe Speler Toevoegen
              </h3>
              <p className="text-xs text-slate-400">
                Selectielid aanmelden voor het team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <form action={action} className="mt-5 space-y-3.5">
          <input type="hidden" name="teamId" value={teamId} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Naam van de speler
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Volledige naam"
                  className={inputStyle}
                />
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Rugnummer
                <input
                  name="jerseyNumber"
                  type="number"
                  min={1}
                  max={99}
                  placeholder="bijv. 10"
                  className={inputStyle}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Positie
              <select name="position" defaultValue="Middenvelder" className={inputStyle}>
                <option value="Keeper">Keeper</option>
                <option value="Verdediger">Verdediger</option>
                <option value="Middenvelder">Middenvelder</option>
                <option value="Aanvaller">Aanvaller</option>
                <option value="Staf">Staf / Begeleiding</option>
              </select>
            </label>

            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Rol
              <select name="role" defaultValue="Speler" className={inputStyle}>
                <option value="Speler">Speler</option>
                <option value="Aanvoerder">Aanvoerder</option>
                <option value="Coach / Trainer">Coach / Trainer</option>
                <option value="Leider">Leider</option>
                <option value="Vaste Vlaggenist">Vaste Vlaggenist</option>
              </select>
            </label>
          </div>

          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
            E-mailadres (Optioneel voor inloggen)
            <input
              name="email"
              type="email"
              placeholder="speler@voorbeeld.nl"
              className={inputStyle}
            />
          </label>

          {state && (
            <div
              className={`rounded-xl p-2.5 text-xs font-medium ${
                state.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Annuleren
            </button>
            <button
              disabled={pending}
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {pending ? "Toevoegen..." : "Speler Toevoegen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPlayerModal({
  teamId,
  player,
  onClose,
}: {
  teamId: string;
  player: TeamCmsPlayer;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<PlayerState, FormData>(
    async (prev, formData) => {
      const res = await updatePlayer(prev, formData);
      if (res?.ok) {
        setTimeout(() => onClose(), 800);
      }
      return res;
    },
    null,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              ✏️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Speler Gegevens Aanpassen
              </h3>
              <p className="text-xs text-slate-400">
                Rugnummer, positie en rol bijwerken
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <form action={action} className="mt-5 space-y-3.5">
          <input type="hidden" name="teamId" value={teamId} />
          <input type="hidden" name="playerId" value={player.id} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Naam
                <input
                  name="name"
                  defaultValue={player.name}
                  required
                  minLength={2}
                  maxLength={80}
                  className={inputStyle}
                />
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Rugnummer
                <input
                  name="jerseyNumber"
                  type="number"
                  defaultValue={player.jerseyNumber ?? ""}
                  min={1}
                  max={99}
                  className={inputStyle}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Positie
              <select name="position" defaultValue={player.position} className={inputStyle}>
                <option value="Keeper">Keeper</option>
                <option value="Verdediger">Verdediger</option>
                <option value="Middenvelder">Middenvelder</option>
                <option value="Aanvaller">Aanvaller</option>
                <option value="Staf">Staf / Begeleiding</option>
              </select>
            </label>

            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Rol
              <select name="role" defaultValue={player.role} className={inputStyle}>
                <option value="Speler">Speler</option>
                <option value="Aanvoerder">Aanvoerder</option>
                <option value="Coach / Trainer">Coach / Trainer</option>
                <option value="Leider">Leider</option>
                <option value="Vaste Vlaggenist">Vaste Vlaggenist</option>
              </select>
            </label>
          </div>

          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
            E-mailadres
            <input
              name="email"
              type="email"
              defaultValue={player.email ?? ""}
              placeholder="speler@voorbeeld.nl"
              className={inputStyle}
            />
          </label>

          {state && (
            <div
              className={`rounded-xl p-2.5 text-xs font-medium ${
                state.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Annuleren
            </button>
            <button
              disabled={pending}
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {pending ? "Opslaan..." : "Wijzigingen Opslaan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeletePlayerModal({
  teamId,
  player,
  onClose,
}: {
  teamId: string;
  player: TeamCmsPlayer;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<PlayerState, FormData>(
    async (prev, formData) => {
      const res = await deletePlayer(prev, formData);
      if (res?.ok) {
        setTimeout(() => onClose(), 800);
      }
      return res;
    },
    null,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700 font-bold">
              🗑️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Speler Verwijderen
              </h3>
              <p className="text-xs text-slate-400">
                Uit de selectie verwijderen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Weet je zeker dat je <strong className="text-slate-900">{player.name}</strong> ({player.position}) wilt verwijderen uit de selectie?
          </p>
        </div>

        <form action={action} className="mt-5 space-y-3">
          <input type="hidden" name="teamId" value={teamId} />
          <input type="hidden" name="playerId" value={player.id} />

          {state && (
            <div
              className={`rounded-xl p-2.5 text-xs font-medium ${
                state.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Annuleren
            </button>
            <button
              disabled={pending}
              type="submit"
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 transition"
            >
              {pending ? "Verwijderen..." : "Speler Verwijderen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
