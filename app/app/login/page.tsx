import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./login-form";
import { SquadbaseLogo } from "@/components/squadbase-logo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Inloggen",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSessionUser()) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-slate-100">
      <div className="w-full max-w-md rounded-3xl bg-navy-900/90 p-8 shadow-2xl border border-navy-800/90 backdrop-blur-md">
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <SquadbaseLogo size="md" variant="light" tagline="Toegang Portaal" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">Inloggen</h1>
          <p className="mt-2 text-sm text-slate-300">
            Vul je e-mailadres in om een veilige inloglink te ontvangen.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-950/60 p-3.5 text-sm text-red-300 border border-red-800/80" role="alert">
            Deze inloglink is ongeldig of verlopen. Vraag hieronder een nieuwe link aan.
          </div>
        )}

        <LoginForm />
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Geen wachtwoorden nodig. Alleen toegang voor geregistreerde teamleden en beheerders.
      </p>
    </main>
  );
}
