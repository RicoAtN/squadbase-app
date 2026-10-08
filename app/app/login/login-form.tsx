"use client";

import { useActionState } from "react";
import { requestLogin, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    requestLogin,
    null,
  );

  return (
    <div className="mt-6">
      <form action={action} className="space-y-4">
        <label className="block text-sm font-semibold text-slate-200">
          E-mailadres
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="naam@voorbeeld.nl"
            className="mt-1.5 w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-white placeholder:text-slate-500 shadow-2xs focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition"
          />
        </label>
        <button
          disabled={pending}
          className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-3 font-black text-navy-950 shadow-md hover:from-gold-400 hover:to-gold-300 disabled:opacity-60 transition"
        >
          {pending ? "Versturen..." : "Stuur inloglink"}
        </button>
        {state && !state.devLink && (
          <p className={state.ok ? "text-gold-400 font-semibold text-sm" : "text-red-400 font-medium text-sm"} role="status">
            {state.message}
          </p>
        )}
      </form>

      {state?.devLink && (
        <div className="mt-6 rounded-2xl border border-gold-500/30 bg-navy-950/80 p-5 text-slate-200 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
              Lokale Test Omgeving
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Er is lokaal nog geen e-mailprovider geconfigureerd. Je kunt direct inloggen via onderstaande link:
          </p>
          <a
            href={state.devLink}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-3 text-center text-sm font-black text-navy-950 shadow hover:from-gold-400 hover:to-gold-300 transition"
          >
            Direct inloggen bij Squadbase &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
