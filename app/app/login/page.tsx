import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Inloggen · Squadbase",
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
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="text-center">
          <span className="text-sm font-black tracking-wider text-emerald-700 uppercase">
            ⚽ Squadbase
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Inloggen</h1>
          <p className="mt-2 text-sm text-slate-600">
            Vul je e-mailadres in om een veilige inloglink te ontvangen.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3.5 text-sm text-red-700 border border-red-200" role="alert">
            Deze inloglink is ongeldig of verlopen. Vraag hieronder een nieuwe link aan.
          </div>
        )}

        <LoginForm />
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        Geen wachtwoorden nodig. Alleen toegang voor geregistreerde teamleden en beheerders.
      </p>
    </main>
  );
}
