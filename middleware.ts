import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "squadbase.nl";
const VALID_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

type Target =
  | { kind: "root" }
  | { kind: "admin" }
  | { kind: "app" }
  | { kind: "tenant"; sub: string }
  | { kind: "invalid" };

function resolveHost(hostHeader: string): Target {
  const host = hostHeader.split(":")[0].toLowerCase();

  let label: string | null = null;
  if (host.endsWith(".localhost")) {
    label = host.slice(0, -".localhost".length); // team.localhost:3000
  } else if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    label = host.slice(0, -(ROOT_DOMAIN.length + 1)); // team.squadbase.nl
  }

  // squadbase.nl, localhost, *.vercel.app previews -> landing page
  if (!label || label === "www") return { kind: "root" };
  if (!VALID_LABEL.test(label)) return { kind: "invalid" };
  if (label === "admin") return { kind: "admin" };
  if (label === "app") return { kind: "app" };
  return { kind: "tenant", sub: label };
}

/**
 * Host-based routing only. Authorization is NOT decided here (middleware
 * can't query the DB and must never be the sole auth layer): every page and
 * server action re-checks the session on the server.
 *
 * Tenant -> team_id resolution happens in app/[subdomain]/page.tsx (Node
 * runtime, safeQuery) rather than here, to keep the edge hop DB-free.
 */
export function middleware(req: NextRequest) {
  const target = resolveHost(req.headers.get("host") ?? "");
  const { pathname } = req.nextUrl;

  const notFound = () => new NextResponse("Not found", { status: 404 });
  const rewriteTo = (prefix: string) => {
    const url = req.nextUrl.clone();
    url.pathname = `${prefix}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  };
  const privateArea = (res: NextResponse) => {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  };

  switch (target.kind) {
    case "invalid":
      return new NextResponse("Invalid host", { status: 400 });

    case "root":
      // Root domain serves the landing page only. Block direct access to
      // internal routes such as /admin, /app or /<team>.
      return pathname === "/" || pathname.startsWith("/api/")
        ? NextResponse.next()
        : notFound();

    case "admin": // admin.squadbase.nl -> app/admin
      return privateArea(rewriteTo("/admin"));

    case "app": // app.squadbase.nl -> app/app
      return privateArea(rewriteTo("/app"));

    case "tenant": // *.squadbase.nl -> app/[subdomain]
      return rewriteTo(`/${target.sub}`);
  }
}

export const config = {
  // Skip Next internals, API routes and files with extensions (static assets)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
