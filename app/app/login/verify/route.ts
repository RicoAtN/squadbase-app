import { NextResponse, type NextRequest } from "next/server";
import { verifyAndLogin } from "@/app/app/login/actions";
import { adminUrl } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") ?? "app.localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const appBaseUrl = `${proto}://${host}`;

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${appBaseUrl}/login?error=1`);
  }

  const role = await verifyAndLogin(token);
  if (!role) {
    return NextResponse.redirect(`${appBaseUrl}/login?error=1`);
  }

  if (role === "superadmin") {
    return NextResponse.redirect(adminUrl());
  }

  return NextResponse.redirect(`${appBaseUrl}/`);
}
