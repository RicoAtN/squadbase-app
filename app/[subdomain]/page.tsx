import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { safeQuery } from "@/lib/db";
import { teams } from "@/db/schema";

// Rendered on demand per tenant; nothing is prebuilt per team.
export const dynamic = "force-dynamic";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const slug = decodeURIComponent(subdomain).toLowerCase();

  const result = await safeQuery((db) =>
    db.select().from(teams).where(eq(teams.subdomain, slug)).limit(1),
  );

  // DB problems -> nearest error boundary (app/[subdomain]/error.tsx)
  if (!result.ok) throw new Error(`team lookup failed: ${result.error}`);

  const team = result.data[0];
  if (!team) notFound();

  if (!team.isActive) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <p className="text-slate-600">Dit team is momenteel niet actief.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Welcome to team: {team.name}
      </h1>
      <p className="text-slate-500">{team.subdomain}.squadbase.nl</p>
    </main>
  );
}
