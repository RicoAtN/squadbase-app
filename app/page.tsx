import { appUrl } from "@/lib/auth";
import { SquadbaseLogo } from "@/components/squadbase-logo";
import Image from "next/image";

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
    <main className="min-h-screen bg-navy-950 text-slate-100">
      {/* Top navigation */}
      <nav className="border-b border-navy-800/80 bg-navy-900/95 backdrop-blur-md px-6 py-3.5 text-white sticky top-0 z-30 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="/" className="transition hover:opacity-95">
            <SquadbaseLogo size="md" variant="light" tagline="Digitaal Clubhuis" />
          </a>
          <div className="flex items-center gap-4">
            <a
              href={`${appUrl()}/login`}
              className="rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-sm font-bold text-gold-300 backdrop-blur hover:bg-gold-500/20 hover:text-white transition"
            >
              Inloggen &rarr;
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900/90 px-6 py-20 text-center text-white sm:py-28">
        {/* Subtle decorative background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
          <div className="h-[500px] w-[500px] rounded-full bg-gold-500/20 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 drop-shadow-2xl">
              <Image
                src="/logo.png"
                alt="Squadbase Crest"
                width={112}
                height={112}
                priority
                unoptimized
                className="object-contain"
              />
            </div>
          </div>

          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-navy-800/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-gold-300 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
            Squadbase · voor amateurvoetbalteams
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl text-white">
            Het digitale clubhuis voor je team
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300 leading-relaxed">
            Stand, boetes en spelersstatistieken op één centrale plek. Je eigen
            teampagina op <span className="font-semibold text-gold-300">jouwteam.squadbase.nl</span>.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#toegang"
              className="inline-block rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-8 py-3.5 text-base sm:text-lg font-black text-navy-950 shadow-lg shadow-gold-500/20 transition hover:from-gold-400 hover:to-gold-300 hover:scale-[1.02]"
            >
              Vraag toegang aan
            </a>
            <a
              href={`${appUrl()}/login`}
              className="inline-block rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-base sm:text-lg font-bold text-white backdrop-blur transition hover:bg-white/20 hover:scale-[1.02]"
            >
              Inloggen als teamlid
            </a>
          </div>
        </div>
      </section>

      {/* Value propositions */}
      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-20 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl bg-navy-900/80 p-6 shadow-md border border-navy-800/90 hover:border-gold-500/40 hover:shadow-gold-500/5 transition duration-200"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-800 border border-navy-700/80 text-2xl group-hover:scale-110 transition-transform" aria-hidden>
              {f.icon}
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">{f.title}</h2>
            <p className="mt-2 text-slate-300 leading-relaxed">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Access request */}
      <section id="toegang" className="bg-navy-900/50 px-6 py-20 border-t border-navy-800/80">
        <div className="mx-auto max-w-lg">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block">
              Starten met Squadbase
            </span>
            <h2 className="mt-1 text-3xl font-extrabold text-white">Vraag toegang aan</h2>
            <p className="mt-3 text-slate-300">
              Squadbase is in besloten MVP-fase. Laat je gegevens achter en we nemen binnen 24 uur contact op.
            </p>
          </div>

          <form
            action="mailto:info@squadbase.nl"
            method="post"
            encType="text/plain"
            className="mt-8 space-y-4"
          >
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Teamnaam</span>
              <input
                name="Teamnaam"
                required
                placeholder="bijv. FC De Rebellen 4"
                className="mt-1 w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-white placeholder:text-slate-500 shadow-2xs focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Jouw naam</span>
              <input
                name="Naam"
                required
                placeholder="bijv. Tim de Vries"
                className="mt-1 w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-white placeholder:text-slate-500 shadow-2xs focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">E-mailadres</span>
              <input
                name="Email"
                type="email"
                required
                placeholder="coach@jouwvereniging.nl"
                className="mt-1 w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-white placeholder:text-slate-500 shadow-2xs focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Bericht (optioneel)</span>
              <textarea
                name="Bericht"
                rows={3}
                placeholder="Vertel ons kort over je team of competitie..."
                className="mt-1 w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-white placeholder:text-slate-500 shadow-2xs focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-3.5 font-black text-navy-950 shadow-lg shadow-gold-500/20 transition hover:from-gold-400 hover:to-gold-300 hover:scale-[1.01]"
            >
              Verstuur aanvraag
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-navy-800/80 bg-navy-950 px-6 py-8 text-center text-sm text-slate-400">
        <div className="flex flex-col items-center justify-center gap-2">
          <SquadbaseLogo size="sm" variant="light" tagline="Club management" />
          <p className="text-xs text-slate-400 mt-2">
            © {new Date().getFullYear()} Squadbase ·{" "}
            <a href="mailto:info@squadbase.nl" className="underline hover:text-gold-400 transition">
              info@squadbase.nl
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
