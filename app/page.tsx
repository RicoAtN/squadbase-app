import { appUrl } from "@/lib/auth";

const features = [
  {
    icon: "🏆",
    title: "Competitiestand",
    text: "Altijd een actuele ranglijst. Uitslagen invoeren kost seconden, de stand rekent zichzelf uit.",
  },
  {
    icon: "💶",
    title: "Boetes & kas",
    text: "Geen Excel of appgroepen meer. Houd boetes bij, zie wie nog moet betalen en beheer de teamkas.",
  },
  {
    icon: "📊",
    title: "Spelersstatistieken",
    text: "Goals, assists, aanwezigheid en meer. Van topscorer tot trouwste trainingsbezoeker.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top navigation */}
      <nav className="border-b border-emerald-800/20 bg-emerald-900 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white">⚽ SQUADBASE</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`${appUrl()}/login`}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
            >
              Inloggen &rarr;
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-900 to-emerald-800 px-6 py-20 text-center text-white sm:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium">
            Squadbase · voor amateurvoetbalteams
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Het digitale clubhuis voor je team
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-emerald-100">
            Stand, boetes en spelersstatistieken op één plek. Je eigen
            teampagina op <span className="font-semibold">jouwteam.squadbase.nl</span>.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#toegang"
              className="inline-block rounded-xl bg-white px-8 py-3 text-lg font-semibold text-emerald-900 shadow-lg transition hover:bg-emerald-50"
            >
              Vraag toegang aan
            </a>
            <a
              href={`${appUrl()}/login`}
              className="inline-block rounded-xl border border-white/30 bg-white/10 px-8 py-3 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Inloggen als teamlid
            </a>
          </div>
        </div>
      </section>

      {/* Value propositions */}
      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-20 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-3xl" aria-hidden>{f.icon}</div>
            <h2 className="mt-4 text-xl font-bold">{f.title}</h2>
            <p className="mt-2 text-slate-600">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Access request (MVP: opens the visitor's mail client, addressed to info@) */}
      <section id="toegang" className="bg-white px-6 py-20 border-t border-slate-200">
        <div className="mx-auto max-w-lg">
          <h2 className="text-center text-3xl font-bold">Vraag toegang aan</h2>
          <p className="mt-3 text-center text-slate-600">
            Squadbase is in besloten MVP-fase. Laat je gegevens achter en we nemen contact op.
          </p>
          <form
            action="mailto:info@squadbase.nl"
            method="post"
            encType="text/plain"
            className="mt-8 space-y-4"
          >
            <label className="block">
              <span className="text-sm font-medium">Teamnaam</span>
              <input name="Teamnaam" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Jouw naam</span>
              <input name="Naam" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">E-mailadres</span>
              <input name="Email" type="email" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Bericht (optioneel)</span>
              <textarea name="Bericht" rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Verstuur aanvraag
            </button>
          </form>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Squadbase ·{" "}
        <a href="mailto:info@squadbase.nl" className="underline">info@squadbase.nl</a>
      </footer>
    </main>
  );
}
