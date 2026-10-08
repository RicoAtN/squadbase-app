"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import {
  updateTeam,
  type UpdateTeamState,
  provisionTeam,
  type ProvisionState,
  archiveTeam,
  restoreTeam,
  type ArchiveState,
  deleteTeam,
  deleteUser,
  type DeleteState,
  resendTeamInvite,
  sendUserLoginLink,
  type InviteState,
} from "./actions";

export type AdminTeamItem = {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  createdAt: Date;
  managerName: string | null;
  managerEmail: string | null;
};

export type AdminUserItem = {
  id: string;
  name: string | null;
  email: string;
  globalRole: string;
  teamName: string | null;
  teamSubdomain: string | null;
  teamRole: string | null;
};

const inputStyle =
  "mt-1.5 w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2 text-sm text-white placeholder:text-slate-500 shadow-2xs focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition";

export function AdminDashboardView({
  teams,
  users,
  currentUserId,
}: {
  teams: AdminTeamItem[];
  users: AdminUserItem[];
  currentUserId: string;
}) {
  const [activeTab, setActiveTab] = useState<"active-teams" | "users" | "archive">("active-teams");
  const [editingTeam, setEditingTeam] = useState<AdminTeamItem | null>(null);
  const [archivingTeam, setArchivingTeam] = useState<AdminTeamItem | null>(null);
  const [restoringTeam, setRestoringTeam] = useState<AdminTeamItem | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<AdminTeamItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null);
  const [invitingTeam, setInvitingTeam] = useState<AdminTeamItem | null>(null);
  const [invitingUser, setInvitingUser] = useState<AdminUserItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeTeams = teams.filter((t) => t.isActive);
  const archivedTeams = teams.filter((t) => !t.isActive);

  const filteredActiveTeams = activeTeams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.managerName && t.managerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.managerEmail && t.managerEmail.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const filteredArchivedTeams = archivedTeams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.managerName && t.managerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.managerEmail && t.managerEmail.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const filteredUsers = users.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.teamName && u.teamName.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="w-full">
      {/* Main Tabbed Card Container */}
      <div className="w-full rounded-2xl bg-navy-900/90 shadow-md border border-navy-800/80 overflow-hidden">
        {/* Card Header with Tabs, Search, and Action */}
        <div className="border-b border-navy-800/80 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-navy-900/95">
          {/* Segmented Tab Switcher */}
          <div className="inline-flex items-center rounded-xl bg-navy-950/80 border border-navy-800/60 p-1">
            <button
              onClick={() => {
                setActiveTab("active-teams");
                setSearchQuery("");
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "active-teams"
                  ? "bg-navy-800 text-white shadow-xs border border-navy-700/80"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="inline-flex items-center gap-1.5"><Image src="/logo.png" alt="" width={14} height={14} className="inline object-contain" /> Actieve Teams</span>
              <span
                className={`rounded-full px-2 py-0.2 text-[11px] font-black ${
                  activeTab === "active-teams"
                    ? "bg-navy-700 text-gold-300"
                    : "bg-navy-900 text-slate-400"
                }`}
              >
                {activeTeams.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("users");
                setSearchQuery("");
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "users"
                  ? "bg-navy-800 text-white shadow-xs border border-navy-700/80"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>👥 Platform Gebruikers</span>
              <span
                className={`rounded-full px-2 py-0.2 text-[11px] font-black ${
                  activeTab === "users"
                    ? "bg-navy-700 text-gold-300"
                    : "bg-navy-900 text-slate-400"
                }`}
              >
                {users.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("archive");
                setSearchQuery("");
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "archive"
                  ? "bg-navy-800 text-amber-300 shadow-xs border border-navy-700/80"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>📦 Archief</span>
              <span
                className={`rounded-full px-2 py-0.2 text-[11px] font-black ${
                  activeTab === "archive"
                    ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                    : "bg-navy-900 text-slate-400"
                }`}
              >
                {archivedTeams.length}
              </span>
            </button>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "active-teams"
                    ? "Zoek actief team..."
                    : activeTab === "archive"
                    ? "Zoek in archief..."
                    : "Zoek gebruiker of team..."
                }
                className="w-44 sm:w-56 rounded-xl border border-navy-700 bg-navy-950 px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/20 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {activeTab === "active-teams" && (
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-3.5 py-1.5 text-xs font-black text-navy-950 shadow-md hover:from-gold-400 hover:to-gold-300 transition shrink-0"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Nieuw Team
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Actieve Teams View */}
        {activeTab === "active-teams" && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-navy-800 bg-navy-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">Team</th>
                  <th className="px-5 py-3">Subdomein</th>
                  <th className="px-5 py-3">Manager</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 bg-transparent text-slate-200">
                {filteredActiveTeams.map((t) => {
                  const teamUrl =
                    process.env.NODE_ENV === "production"
                      ? `https://${t.subdomain}.squadbase.nl`
                      : `http://${t.subdomain}.localhost:3000`;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-navy-800/40 transition-colors"
                    >
                      {/* Team Name */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-navy-800 to-navy-950 ring-1 ring-gold-500/30 font-black text-xs text-gold-300 shadow-2xs">
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block leading-tight text-sm">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Actief team
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subdomain Link */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <a
                          href={teamUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-navy-950 border border-navy-700/80 px-2 py-0.5 text-xs font-medium text-slate-200 hover:border-gold-500/40 transition"
                        >
                          <span className="font-mono text-xs font-bold text-gold-300">
                            {t.subdomain}
                          </span>
                          <span className="text-slate-400 text-xs">.squadbase.nl</span>
                          <svg className="h-3 w-3 text-slate-400 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </td>

                      {/* Manager Details */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        {t.managerEmail ? (
                          <div>
                            <div className="font-semibold text-white leading-tight text-xs">
                              {t.managerName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {t.managerEmail}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Geen manager</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-800/80">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live in Productie
                        </span>
                      </td>

                      {/* Horizontal Action Buttons */}
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {t.managerEmail && (
                            <button
                              onClick={() => setInvitingTeam(t)}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-900/60 bg-blue-950/40 px-2.5 py-1 text-xs font-bold text-blue-300 shadow-2xs hover:bg-blue-900/60 transition"
                              title="Stuur / genereer inloglink voor de coach"
                            >
                              <span>📨</span>
                              Invite Sturen
                            </button>
                          )}

                          <button
                            onClick={() => setEditingTeam(t)}
                            className="inline-flex items-center gap-1 rounded-lg border border-navy-700 bg-navy-800/80 px-2.5 py-1 text-xs font-bold text-slate-200 shadow-2xs hover:bg-navy-700 hover:text-white transition"
                          >
                            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Bewerken
                          </button>

                          <button
                            onClick={() => setArchivingTeam(t)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-900/60 bg-amber-950/40 px-2.5 py-1 text-xs font-bold text-amber-300 shadow-2xs hover:bg-amber-900/60 transition"
                            title="Verplaats naar Archief"
                          >
                            <span>📦</span>
                            Archiveren
                          </button>

                          <a
                            href={teamUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-navy-800 border border-navy-700 px-2.5 py-1 text-xs font-bold text-slate-200 shadow-2xs hover:bg-navy-750 hover:text-white transition"
                          >
                            Teampagina
                            <span aria-hidden>&rarr;</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredActiveTeams.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-xs">
                      {searchQuery ? "Geen actieve teams gevonden met deze zoekopdracht." : "Nog geen actieve teams aangemaakt."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Users View */}
        {activeTab === "users" && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-navy-800 bg-navy-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">Naam</th>
                  <th className="px-5 py-3">E-mail</th>
                  <th className="px-5 py-3">Platform Rol</th>
                  <th className="px-5 py-3">Gekoppeld Team</th>
                  <th className="px-5 py-3 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 bg-transparent text-slate-200">
                {filteredUsers.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const teamUrl = u.teamSubdomain
                    ? process.env.NODE_ENV === "production"
                      ? `https://${u.teamSubdomain}.squadbase.nl`
                      : `http://${u.teamSubdomain}.localhost:3000`
                    : null;

                  return (
                    <tr key={u.id} className="hover:bg-navy-800/40 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white whitespace-nowrap text-xs">
                        {u.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-400 whitespace-nowrap font-mono text-xs">
                        {u.email}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {u.globalRole === "superadmin" ? (
                          <span className="inline-flex items-center rounded-full bg-purple-950/60 px-2 py-0.5 text-[11px] font-bold text-purple-300 border border-purple-800/80">
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-navy-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-navy-700">
                            Team Beheerder
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {u.teamName ? (
                          <a
                            href={teamUrl ?? "#"}
                            target={teamUrl ? "_blank" : undefined}
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-navy-950 border border-navy-800 px-2.5 py-0.5 text-xs font-semibold text-slate-200 hover:border-gold-500/40 transition"
                          >
                            <span className="inline-flex items-center gap-1"><Image src="/logo.png" alt="" width={12} height={12} className="inline object-contain" /> {u.teamName}</span>
                            <span className="text-[10px] text-gold-400 uppercase font-bold">
                              ({u.teamRole === "manager" ? "Coach" : "Speler"})
                            </span>
                          </a>
                        ) : u.globalRole === "superadmin" ? (
                          <span className="text-xs text-slate-400 italic">
                            — (Platform Beheerder)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Geen team</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setInvitingUser(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-900/60 bg-blue-950/40 px-2.5 py-1 text-xs font-bold text-blue-300 shadow-2xs hover:bg-blue-900/60 transition"
                            title="Stuur inloglink naar deze gebruiker"
                          >
                            <span>📨</span>
                            Inloglink Sturen
                          </button>

                          {isSelf ? (
                            <span className="rounded-md bg-navy-800 px-2 py-1 text-[11px] font-medium text-slate-400 border border-navy-700">
                              Jouw account
                            </span>
                          ) : (
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-900/60 bg-red-950/40 px-2.5 py-1 text-xs font-bold text-red-300 shadow-2xs hover:bg-red-900/60 transition"
                              title="Gebruiker Verwijderen"
                            >
                              <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Verwijderen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-xs">
                      {searchQuery ? "Geen gebruikers gevonden met deze zoekopdracht." : "Geen gebruikers geregistreerd."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Archief View */}
        {activeTab === "archive" && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-navy-800 bg-amber-950/40 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  <th className="px-5 py-3">Gearchiveerd Team</th>
                  <th className="px-5 py-3">Subdomein</th>
                  <th className="px-5 py-3">Manager</th>
                  <th className="px-5 py-3">Archief Status</th>
                  <th className="px-5 py-3 text-right">Herstellen & Verwijderen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 bg-transparent text-slate-200">
                {filteredArchivedTeams.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-amber-950/20 transition-colors opacity-90"
                  >
                    {/* Team Name */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-slate-400 border border-navy-700 font-bold text-xs">
                          📦
                        </div>
                        <div>
                          <span className="font-bold text-white block leading-tight text-sm">
                            {t.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Data veilig bewaard
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Subdomain */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-400 bg-navy-950 px-2 py-0.5 rounded-md border border-navy-800 line-through">
                        {t.subdomain}.squadbase.nl
                      </span>
                    </td>

                    {/* Manager Details */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      {t.managerEmail ? (
                        <div>
                          <div className="font-semibold text-white leading-tight text-xs">
                            {t.managerName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {t.managerEmail}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Geen manager</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/60 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-800/60">
                        📦 Inactief (Offline)
                      </span>
                    </td>

                    {/* Actions: Restore or Hard Delete */}
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setRestoringTeam(t)}
                          className="inline-flex items-center gap-1 rounded-lg border border-navy-700 bg-navy-800/80 px-2.5 py-1 text-xs font-bold text-slate-200 shadow-2xs hover:bg-navy-700 hover:text-white transition"
                          title="Zet team weer online"
                        >
                          <span>♻️</span>
                          Terugzetten
                        </button>

                        <button
                          onClick={() => setDeletingTeam(t)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-900/60 bg-red-950/40 px-2.5 py-1 text-xs font-bold text-red-300 shadow-2xs hover:bg-red-900/60 transition"
                          title="Definitief Verwijderen"
                        >
                          <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Definitief Verwijderen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredArchivedTeams.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-xs">
                      {searchQuery ? "Geen gearchiveerde teams gevonden met deze zoekopdracht." : "Het archief is momenteel leeg."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingTeam && (
        <EditTeamModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
        />
      )}

      {isCreating && (
        <CreateTeamModal
          onClose={() => setIsCreating(false)}
        />
      )}

      {invitingTeam && (
        <SendTeamInviteModal
          team={invitingTeam}
          onClose={() => setInvitingTeam(null)}
        />
      )}

      {invitingUser && (
        <SendUserLoginModal
          user={invitingUser}
          onClose={() => setInvitingUser(null)}
        />
      )}

      {archivingTeam && (
        <ArchiveTeamModal
          team={archivingTeam}
          onClose={() => setArchivingTeam(null)}
        />
      )}

      {restoringTeam && (
        <RestoreTeamModal
          team={restoringTeam}
          onClose={() => setRestoringTeam(null)}
        />
      )}

      {deletingTeam && (
        <DeleteTeamModal
          team={deletingTeam}
          onClose={() => setDeletingTeam(null)}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
}

function SendTeamInviteModal({
  team,
  onClose,
}: {
  team: AdminTeamItem;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState<InviteState, FormData>(
    resendTeamInvite,
    null,
  );

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-navy-900 p-6 shadow-2xl border border-navy-700/80 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950/80 border border-blue-700/50 text-blue-300 font-bold">
              📨
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Uitnodiging & Inloglink
              </h3>
              <p className="text-xs text-slate-400">
                Direct versturen naar team coach
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Stuur een verse, veilige 1-klik inloglink naar <strong className="text-white">{team.managerName}</strong> (<span className="font-mono text-slate-300">{team.managerEmail}</span>) voor het beheren van <strong className="text-white">{team.name}</strong>.
          </p>
          <div className="rounded-xl bg-blue-950/60 p-2.5 text-[11px] text-blue-200 border border-blue-800/80 flex items-center gap-2">
            <span>ℹ️</span>
            <span>De uitnodigingslink is <strong>7 dagen geldig</strong>, zodat de coach rustig de tijd heeft om in te loggen.</span>
          </div>
        </div>

        <form action={action} className="mt-5 space-y-3.5">
          <input type="hidden" name="teamId" value={team.id} />

          {state && (
            <div className="space-y-2">
              <div
                className={`rounded-xl p-3 text-xs font-medium ${
                  state.ok ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-red-950/80 text-red-300 border border-red-800"
                }`}
              >
                {state.message}
              </div>

              {state.link && (
                <div className="rounded-xl bg-navy-950/90 p-3 border border-navy-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Directe Inloglink (WhatsApp / Kopiëren)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={state.link}
                      className="w-full font-mono text-[11px] bg-navy-900 border border-navy-700 rounded-lg px-2 py-1 text-gold-300 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyLink(state.link!)}
                      className="shrink-0 rounded-lg bg-gold-500 px-3 py-1 text-xs font-bold text-navy-950 hover:bg-gold-400 transition"
                    >
                      {copied ? "Gekopieerd! ✓" : "Kopieer"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-navy-800 hover:text-white transition"
            >
              Sluiten
            </button>
            <button
              disabled={pending}
              type="submit"
              className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-xs font-bold text-navy-950 shadow-sm hover:brightness-110 disabled:opacity-50 transition inline-flex items-center gap-1.5"
            >
              <span>📨</span>
              <span>{pending ? "Versturen..." : "E-mail Nu Versturen"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SendUserLoginModal({
  user,
  onClose,
}: {
  user: AdminUserItem;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState<InviteState, FormData>(
    sendUserLoginLink,
    null,
  );

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-navy-900 p-6 shadow-2xl border border-navy-700/80 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950/80 border border-blue-700/50 text-blue-300 font-bold">
              📨
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Inloglink Versturen
              </h3>
              <p className="text-xs text-slate-400">
                Directe magic link voor gebruiker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Stuur een eenmalige 1-klik inloglink naar <strong className="text-white">{user.name ?? "Gebruiker"}</strong> (<span className="font-mono text-slate-300">{user.email}</span>).
          </p>
        </div>

        <form action={action} className="mt-5 space-y-3.5">
          <input type="hidden" name="userId" value={user.id} />

          {state && (
            <div className="space-y-2">
              <div
                className={`rounded-xl p-3 text-xs font-medium ${
                  state.ok ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-red-950/80 text-red-300 border border-red-800"
                }`}
              >
                {state.message}
              </div>

              {state.link && (
                <div className="rounded-xl bg-navy-950/90 p-3 border border-navy-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Directe Inloglink (WhatsApp / Kopiëren)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={state.link}
                      className="w-full font-mono text-[11px] bg-navy-900 border border-navy-700 rounded-lg px-2 py-1 text-gold-300 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyLink(state.link!)}
                      className="shrink-0 rounded-lg bg-gold-500 px-3 py-1 text-xs font-bold text-navy-950 hover:bg-gold-400 transition"
                    >
                      {copied ? "Gekopieerd! ✓" : "Kopieer"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-navy-800 hover:text-white transition"
            >
              Sluiten
            </button>
            <button
              disabled={pending}
              type="submit"
              className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-xs font-bold text-navy-950 shadow-sm hover:brightness-110 disabled:opacity-50 transition inline-flex items-center gap-1.5"
            >
              <span>📨</span>
              <span>{pending ? "Versturen..." : "Inloglink Versturen"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateTeamModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState<ProvisionState, FormData>(
    provisionTeam,
    null,
  );

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-navy-900 p-6 shadow-2xl border border-navy-700/80 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-950 p-1.5 text-navy-900 font-bold border border-gold-500/20 shadow-2xs">
              <Image src="/logo.png" alt="Squadbase" width={22} height={22} className="object-contain" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Nieuw Team Aanmaken
              </h3>
              <p className="text-xs text-slate-400">
                Creëert direct een subdomein en verstuurt de uitnodiging (7 dagen geldig)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <form action={action} className="mt-5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Teamnaam
              <input
                name="teamName"
                required
                minLength={2}
                maxLength={80}
                placeholder="bijv. Ajax Zaterdag 4"
                className={inputStyle}
              />
            </label>

            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Subdomein
              <input
                name="subdomain"
                required
                pattern="[a-z0-9\-]{2,32}"
                placeholder="bijv. ajaxzat4"
                className={inputStyle}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Manager Naam
              <input
                name="managerName"
                required
                minLength={2}
                maxLength={80}
                placeholder="Naam van de coach"
                className={inputStyle}
              />
            </label>

            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Manager E-mail (Ontvangt Uitnodiging)
              <input
                name="managerEmail"
                type="email"
                required
                placeholder="coach@voorbeeld.nl"
                className={inputStyle}
              />
            </label>
          </div>

          {state && (
            <div className="space-y-2">
              <div
                className={`rounded-xl p-3 text-xs font-medium ${
                  state.ok ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-red-950/80 text-red-300 border border-red-800"
                }`}
              >
                {state.message}
              </div>

              {state.inviteLink && (
                <div className="rounded-xl bg-navy-950/90 p-3 border border-navy-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Directe WhatsApp Inloglink
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={state.inviteLink}
                      className="w-full font-mono text-[11px] bg-navy-900 border border-navy-700 rounded-lg px-2 py-1 text-gold-300 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyLink(state.inviteLink!)}
                      className="shrink-0 rounded-lg bg-gold-500 px-3 py-1 text-xs font-bold text-navy-950 hover:bg-gold-400 transition"
                    >
                      {copied ? "Gekopieerd! ✓" : "Kopieer"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-navy-800 hover:text-white transition"
            >
              {state?.ok ? "Klaar" : "Annuleren"}
            </button>
            {!state?.ok && (
              <button
                disabled={pending}
                type="submit"
                className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-xs font-bold text-navy-950 shadow-sm hover:brightness-110 disabled:opacity-50 transition"
              >
                {pending ? "Aanmaken..." : "Team Aanmaken & Uitnodigen"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function EditTeamModal({
  team,
  onClose,
}: {
  team: AdminTeamItem;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<UpdateTeamState, FormData>(
    async (prev, formData) => {
      const res = await updateTeam(prev, formData);
      if (res?.ok) {
        setTimeout(() => onClose(), 800);
      }
      return res;
    },
    null,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-navy-900 p-6 shadow-2xl border border-navy-700/80 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-950 text-gold-400 border border-gold-500/30 font-bold">
              ✏️
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Team Gegevens Aanpassen
              </h3>
              <p className="text-xs text-slate-400">
                Subdomein en toegewezen manager bijwerken
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <form action={action} className="mt-5 space-y-3.5">
          <input type="hidden" name="teamId" value={team.id} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Teamnaam
              <input
                name="teamName"
                defaultValue={team.name}
                required
                minLength={2}
                maxLength={80}
                placeholder="bijv. FC Cojones"
                className={inputStyle}
              />
            </label>

            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Subdomein
              <input
                name="subdomain"
                defaultValue={team.subdomain}
                required
                pattern="[a-z0-9\-]{2,32}"
                placeholder="bijv. fccojones"
                className={inputStyle}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Manager Naam
              <input
                name="managerName"
                defaultValue={team.managerName ?? ""}
                required
                minLength={2}
                maxLength={80}
                placeholder="Naam van de coach"
                className={inputStyle}
              />
            </label>

            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Manager E-mail
              <input
                name="managerEmail"
                type="email"
                defaultValue={team.managerEmail ?? ""}
                required
                placeholder="coach@voorbeeld.nl"
                className={inputStyle}
              />
            </label>
          </div>

          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Status
            <select
              name="isActive"
              defaultValue={team.isActive ? "true" : "false"}
              className={inputStyle}
            >
              <option value="true">Actief (publiek bereikbaar)</option>
              <option value="false">Inactief (geblokkeerd / gearchiveerd)</option>
            </select>
          </label>

          {state && (
            <div
              className={`rounded-xl p-2.5 text-xs font-medium ${
                state.ok ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-red-950/80 text-red-300 border border-red-800"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-navy-800 hover:text-white transition"
            >
              Annuleren
            </button>
            <button
              disabled={pending}
              type="submit"
              className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-xs font-bold text-navy-950 shadow-sm hover:brightness-110 disabled:opacity-50 transition"
            >
              {pending ? "Opslaan..." : "Wijzigingen Opslaan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ArchiveTeamModal({
  team,
  onClose,
}: {
  team: AdminTeamItem;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<ArchiveState, FormData>(
    async (prev, formData) => {
      const res = await archiveTeam(prev, formData);
      if (res?.ok) {
        setTimeout(() => onClose(), 800);
      }
      return res;
    },
    null,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-navy-900 p-6 shadow-2xl border border-navy-700/80 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-950/80 border border-amber-700/50 text-amber-300 font-bold">
              📦
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Team Archiveren
              </h3>
              <p className="text-xs text-slate-400">
                Tijdelijk uitschakelen met behoud van alle data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Weet je zeker dat je het team <strong className="text-white">{team.name}</strong> wilt verplaatsen naar het archief?
          </p>
          <div className="rounded-xl bg-amber-950/50 p-3 text-[11px] text-amber-200 border border-amber-800/60 space-y-1.5">
            <div>✓ <strong>Website offline:</strong> <span className="font-mono text-amber-300">{team.subdomain}.squadbase.nl</span> wordt tijdelijk gedeactiveerd.</div>
            <div>✓ <strong>Inloggen geblokkeerd:</strong> De teammanager en spelers kunnen niet meer inloggen.</div>
            <div>✓ <strong>Data blijft 100% veilig:</strong> Alle selectie-, boetepot- en statistiekgegevens blijven bewaard. Je kunt het team op elk moment weer terugzetten!</div>
          </div>
        </div>

        <form action={action} className="mt-5 space-y-3">
          <input type="hidden" name="teamId" value={team.id} />

          {state && (
            <div
              className={`rounded-xl p-2.5 text-xs font-medium ${
                state.ok ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-red-950/80 text-red-300 border border-red-800"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-navy-800 hover:text-white transition"
            >
              Annuleren
            </button>
            <button
              disabled={pending}
              type="submit"
              className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-500 disabled:opacity-50 transition"
            >
              {pending ? "Archiveren..." : "Team Archiveren"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RestoreTeamModal({
  team,
  onClose,
}: {
  team: AdminTeamItem;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<ArchiveState, FormData>(
    async (prev, formData) => {
      const res = await restoreTeam(prev, formData);
      if (res?.ok) {
        setTimeout(() => onClose(), 800);
      }
      return res;
    },
    null,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-navy-900 p-6 shadow-2xl border border-navy-700/80 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 font-bold">
              ♻️
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Team Herstellen
              </h3>
              <p className="text-xs text-slate-400">
                Direct terugplaatsen in productie
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Weet je zeker dat je het team <strong className="text-white">{team.name}</strong> wilt herstellen?
          </p>
          <div className="rounded-xl bg-emerald-950/50 p-3 text-[11px] text-emerald-200 border border-emerald-800/60">
            ✓ Het subdomein <strong className="font-mono text-emerald-300">{team.subdomain}.squadbase.nl</strong> en de CMS-inlog voor de manager worden direct weer geactiveerd.
          </div>
        </div>

        <form action={action} className="mt-5 space-y-3">
          <input type="hidden" name="teamId" value={team.id} />

          {state && (
            <div
              className={`rounded-xl p-2.5 text-xs font-medium ${
                state.ok ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-red-950/80 text-red-300 border border-red-800"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-navy-800 hover:text-white transition"
            >
              Annuleren
            </button>
            <button
              disabled={pending}
              type="submit"
              className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-xs font-bold text-navy-950 shadow-xs hover:brightness-110 disabled:opacity-50 transition"
            >
              {pending ? "Herstellen..." : "Team Weer Live Zetten"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteTeamModal({
  team,
  onClose,
}: {
  team: AdminTeamItem;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<DeleteState, FormData>(
    async (prev, formData) => {
      const res = await deleteTeam(prev, formData);
      if (res?.ok) {
        setTimeout(() => onClose(), 800);
      }
      return res;
    },
    null,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-navy-900 p-6 shadow-2xl border border-navy-700/80 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-950/80 border border-red-700/50 text-red-400 font-bold">
              🗑️
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Definitief Verwijderen
              </h3>
              <p className="text-xs text-red-400 font-semibold">
                Onomkeerbare database actie
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Weet je 100% zeker dat je team <strong className="text-white">{team.name}</strong> definitief wilt verwijderen uit de database?
          </p>
          <div className="rounded-xl bg-red-950/50 p-3 text-[11px] text-red-300 border border-red-800/60">
            ⚠️ <strong>Let op:</strong> Dit verwijdert alle gekoppelde selectieleden, kasboeken, boetepot en instellingen permanent. Deze actie kan <u>niet</u> ongedaan worden gemaakt.
          </div>
        </div>

        <form action={action} className="mt-5 space-y-3">
          <input type="hidden" name="teamId" value={team.id} />

          {state && (
            <div
              className={`rounded-xl p-2.5 text-xs font-medium ${
                state.ok ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-red-950/80 text-red-300 border border-red-800"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-navy-800 hover:text-white transition"
            >
              Annuleren
            </button>
            <button
              disabled={pending}
              type="submit"
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-500 disabled:opacity-50 transition"
            >
              {pending ? "Verwijderen..." : "Definitief Verwijderen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteUserModal({
  user,
  onClose,
}: {
  user: AdminUserItem;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<DeleteState, FormData>(
    async (prev, formData) => {
      const res = await deleteUser(prev, formData);
      if (res?.ok) {
        setTimeout(() => onClose(), 800);
      }
      return res;
    },
    null,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-navy-900 p-6 shadow-2xl border border-navy-700/80 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-950/80 border border-red-700/50 text-red-400 font-bold">
              🗑️
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Gebruiker Verwijderen
              </h3>
              <p className="text-xs text-slate-400">
                Platform account verwijderen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Weet je zeker dat je gebruiker <strong className="text-white">{user.name ?? "Onbekend"}</strong> (<span className="font-mono text-slate-300">{user.email}</span>) wilt verwijderen van het platform?
          </p>
          {user.teamName && (
            <div className="rounded-xl bg-amber-950/50 p-3 text-[11px] text-amber-200 border border-amber-800/60">
              ℹ️ Deze gebruiker is gekoppeld aan <strong>{user.teamName}</strong> als coach/speler. De koppeling wordt verbroken.
            </div>
          )}
        </div>

        <form action={action} className="mt-5 space-y-3">
          <input type="hidden" name="userId" value={user.id} />

          {state && (
            <div
              className={`rounded-xl p-2.5 text-xs font-medium ${
                state.ok ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-red-950/80 text-red-300 border border-red-800"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-navy-800 hover:text-white transition"
            >
              Annuleren
            </button>
            <button
              disabled={pending}
              type="submit"
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-500 disabled:opacity-50 transition"
            >
              {pending ? "Verwijderen..." : "Gebruiker Verwijderen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
