"use client";

import { SquadbaseLogo } from "@/components/squadbase-logo";

export default function TeamError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center bg-navy-950 text-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-navy-800 p-8 shadow-2xl">
        <div className="flex justify-center mb-4">
          <SquadbaseLogo size="md" variant="light" />
        </div>
        <h1 className="text-2xl font-bold text-white">Er ging iets mis</h1>
        <p className="text-slate-400 mt-2 text-sm">
          We konden dit team nu niet laden. Probeer het zo opnieuw.
        </p>
        <button
          onClick={reset}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2.5 font-bold text-navy-950 shadow-sm hover:brightness-110 transition cursor-pointer"
        >
          Opnieuw proberen
        </button>
      </div>
    </main>
  );
}
