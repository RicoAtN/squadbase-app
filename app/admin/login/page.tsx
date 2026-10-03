import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/session";
import { LoginForm } from "@/app/app/login/login-form";

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
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800 uppercase tracking-wider">
            👑 Super Admin Portal
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Beheerder Inloggen</h1>
          <p className="mt-2 text-sm text-slate-600">
            Vul je superadmin e-mailadres in om in te loggen bij het platformbeheerderspaneel.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3.5 text-sm text-red-700 border border-red-200" role="alert">
            Deze inloglink is ongeldig of verlopen. Vraag hieronder een nieuwe link aan.
          </div>
        )}

        <LoginForm />
      </div>
    </main>
  );
}
