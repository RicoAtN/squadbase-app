import { NextResponse, type NextRequest } from "next/server";
import { verifyAndLogin } from "@/app/app/login/actions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") ?? "admin.localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const adminBaseUrl = `${proto}://${host}`;

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${adminBaseUrl}/login?error=1`);
  }

  try {
    const result = await verifyAndLogin(token);
    if (!result) {
      return NextResponse.redirect(`${adminBaseUrl}/login?error=1`);
    }

    const { cookieData } = result;
    const response = NextResponse.redirect(`${adminBaseUrl}/`);
    if (cookieData) {
      response.cookies.set(cookieData.name, cookieData.value, cookieData.options);
    }

    return response;
  } catch (err) {
    console.error("[admin verify route error]", err);
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#071324;color:#fff;">
        <h2 style="color:#f87171;">Admin Inloggen mislukt (500)</h2>
        <p style="color:#cbd5e1;">Foutmelding: <code>${msg}</code></p>
        <p style="color:#94a3b8;font-size:13px;">Controleer of SESSION_SECRET is ingesteld in Vercel Environment Variables.</p>
        <a href="${adminBaseUrl}/login" style="color:#c49e4b;font-weight:bold;">&larr; Terug naar inloggen</a>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
