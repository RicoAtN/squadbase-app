import { SquadbaseLogo } from "@/components/squadbase-logo";

export default function TeamNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center bg-navy-950 text-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-navy-800 p-8 shadow-2xl">
        <div className="flex justify-center mb-4">
          <SquadbaseLogo size="md" variant="light" />
        </div>
        <h1 className="text-2xl font-bold text-white">Team niet gevonden</h1>
        <p className="text-slate-400 mt-2 text-sm">
          Dit team bestaat niet (meer). Controleer het adres of ga terug naar Squadbase.
        </p>
        <a
          href="https://squadbase.nl"
          className="mt-6 inline-block w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2.5 font-bold text-navy-950 shadow-sm hover:brightness-110 transition text-sm"
        >
          Naar Squadbase.nl &rarr;
        </a>
      </div>
    </main>
  );
}
