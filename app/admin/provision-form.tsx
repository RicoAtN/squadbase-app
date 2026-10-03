"use client";

import { useActionState } from "react";
import { provisionTeam, type ProvisionState } from "./actions";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200";

export function ProvisionForm() {
  const [state, action, pending] = useActionState<ProvisionState, FormData>(
    provisionTeam,
    null,
  );

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm font-medium">
        Team name
        <input name="teamName" required minLength={2} maxLength={80} className={input} />
      </label>
      <label className="block text-sm font-medium">
        Subdomain
        <input name="subdomain" required pattern="[a-z0-9\-]{3,32}" className={input} />
      </label>
      <label className="block text-sm font-medium">
        Manager name
        <input name="managerName" required minLength={2} maxLength={80} className={input} />
      </label>
      <label className="block text-sm font-medium">
        Manager email
        <input name="managerEmail" type="email" required className={input} />
      </label>
      <button
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create team"}
      </button>
      {state && (
        <p className={state.ok ? "text-emerald-700" : "text-red-600"} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
