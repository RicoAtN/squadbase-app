import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "squadbase.nl";
const RESERVED = new Set(["www"]);
const VALID_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function getSubdomain(hostHeader: string): string | null {
  const host = hostHeader.split(":")[0].toLowerCase();

  // Local dev: team.localhost:3000
  if (host.endsWith(".localhost")) {
    return host.slice(0, -".localhost".length) || null;
  }
  // Production: team.squadbase.nl
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    return host.slice(0, -(ROOT_DOMAIN.length + 1)) || null;
  }
  // Root domain, localhost, *.vercel.app previews, etc. -> landing page
  return null;
}

export function middleware(req: NextRequest) {
  const sub = getSubdomain(req.headers.get("host") ?? "");

  if (!sub || RESERVED.has(sub)) return NextResponse.next();

  if (!VALID_LABEL.test(sub)) {
    return new NextResponse("Invalid team name", { status: 400 });
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${sub}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes and files with extensions (static assets)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
