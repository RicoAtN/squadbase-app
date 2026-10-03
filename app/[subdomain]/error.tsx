"use client";

export default function TeamError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">Er ging iets mis</h1>
      <p className="text-slate-600">
        We konden dit team nu niet laden. Probeer het zo opnieuw.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
      >
        Opnieuw proberen
      </button>
    </main>
  );
}
