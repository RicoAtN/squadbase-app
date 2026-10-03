// Rendered on demand per tenant. No generateStaticParams on purpose, so no
// per-tenant HTML is generated at build time (keeps deployment size small).
export const dynamic = "force-dynamic";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const team = decodeURIComponent(subdomain);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold tracking-tight">
        Welcome to team: {team}
      </h1>
    </main>
  );
}
