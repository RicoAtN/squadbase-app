export default function TeamNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-3xl font-bold">Team niet gevonden</h1>
      <p className="text-slate-600">
        Dit team bestaat niet (meer). Controleer het adres.
      </p>
      <a href="https://squadbase.nl" className="font-medium text-emerald-700 underline">
        Naar squadbase.nl
      </a>
    </main>
  );
}
