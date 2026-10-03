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

  const role = await verifyAndLogin(token);
  if (!role) {
    return NextResponse.redirect(`${adminBaseUrl}/login?error=1`);
  }

  // Direct redirect strictly to Super Admin Dashboard root on the admin subdomain
  return NextResponse.redirect(`${adminBaseUrl}/`);
}
