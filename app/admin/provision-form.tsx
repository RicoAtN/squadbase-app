"use client";

import { useState, useActionState } from "react";
import { provisionTeam, type ProvisionState } from "./actions";

const input =
  "mt-1 w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2 text-sm text-white placeholder:text-slate-500 shadow-2xs focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition";

export function ProvisionForm() {
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState<ProvisionState, FormData>(
    provisionTeam,
    null,
  );

  const copy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm font-semibold text-slate-200">
        Teamnaam
        <input name="teamName" required minLength={2} maxLength={80} className={input} placeholder="bijv. AFC Ajax Zaterdag 3" />
      </label>
      <label className="block text-sm font-semibold text-slate-200">
        Subdomein
        <input name="subdomain" required pattern="[a-z0-9\-]{3,32}" className={input} placeholder="bijv. ajax-zat3" />
      </label>
      <label className="block text-sm font-semibold text-slate-200">
        Naam coach / beheerder
        <input name="managerName" required minLength={2} maxLength={80} className={input} placeholder="bijv. Jan Jansen" />
      </label>
      <label className="block text-sm font-semibold text-slate-200">
        E-mailadres beheerder
        <input name="managerEmail" type="email" required className={input} placeholder="coach@vereniging.nl" />
      </label>
      <button
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-3 font-black text-navy-950 shadow-md hover:from-gold-400 hover:to-gold-300 disabled:opacity-60 transition"
      >
        {pending ? "Aanmaken..." : "Team Aanmaken"}
      </button>

      {state && (
        <div className="space-y-3 pt-2">
          <p className={state.ok ? "text-gold-400 font-semibold text-sm" : "text-red-400 font-medium text-sm"} role="status">
            {state.message}
          </p>

          {state.inviteLink && (
            <div className="rounded-2xl border border-gold-500/30 bg-navy-950/80 p-4 text-slate-200 shadow-md animate-in fade-in">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400 block mb-1">
                Uitnodigingslink voor Manager
              </span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={state.inviteLink}
                  className="w-full font-mono text-xs bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-gold-300 select-all"
                />
                <button
                  type="button"
                  onClick={() => copy(state.inviteLink!)}
                  className="shrink-0 rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-bold text-navy-950 hover:bg-gold-400 transition"
                >
                  {copied ? "Gekopieerd! ✓" : "Kopieer"}
                </button>
              </div>
              <a
                href={state.inviteLink}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition"
              >
                Direct openen als manager (nieuw tabblad) &rarr;
              </a>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
