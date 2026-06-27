import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(request: Request) {
  const state = crypto.randomBytes(20).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const clientId = process.env.LINKEDIN_CLIENT_ID || "";
  const host = request.headers.get("host");
  const protocol = host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
    : host 
      ? `${protocol}://${host}`
      : "http://localhost:3000";

  const redirectUri = `${appUrl}/api/auth/oauth/linkedin/callback`;

  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${state}&scope=openid%20profile%20email`;

  return NextResponse.redirect(linkedinAuthUrl);
}
