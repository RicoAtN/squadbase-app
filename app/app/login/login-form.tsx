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
        <label className="block text-sm font-medium text-slate-700">
          E-mailadres
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="naam@voorbeeld.nl"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <button
          disabled={pending}
          className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition"
        >
          {pending ? "Versturen..." : "Stuur inloglink"}
        </button>
        {state && !state.devLink && (
          <p className={state.ok ? "text-emerald-700 font-medium" : "text-red-600 font-medium"} role="status">
            {state.message}
          </p>
        )}
      </form>

      {state?.devLink && (
        <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-950 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Lokale Test Omgeving
            </span>
          </div>
          <p className="mt-2 text-sm text-emerald-800">
            Er is lokaal nog geen e-mailprovider geconfigureerd. Je kunt direct inloggen via onderstaande link:
          </p>
          <a
            href={state.devLink}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white shadow hover:bg-emerald-700 transition"
          >
            Direct inloggen bij Squadbase &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
