import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/session";
import { LoginForm } from "@/app/app/login/login-form";
import { SquadbaseLogo } from "@/components/squadbase-logo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Super Admin Inloggen · Squadbase",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await requireSuperadmin();
  if (admin) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-slate-100">
      <div className="w-full max-w-md rounded-3xl bg-navy-900/90 p-8 shadow-2xl border border-navy-800/90 backdrop-blur-md">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <SquadbaseLogo size="md" variant="light" tagline="Platform Beheer" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-300 uppercase tracking-wider">
            👑 Super Admin Portal
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">Beheerder Inloggen</h1>
          <p className="mt-2 text-sm text-slate-300">
            Vul je superadmin e-mailadres in om in te loggen bij het platformbeheerderspaneel.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-950/60 p-3.5 text-sm text-red-300 border border-red-800/80" role="alert">
            Deze inloglink is ongeldig of verlopen. Vraag hieronder een nieuwe link aan.
          </div>
        )}

        <LoginForm />
      </div>
    </main>
  );
}
