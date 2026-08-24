import { type NextRequest, NextResponse } from "next/server";

import { exchangeMagicLink } from "../../../../lib/auth";
import { sessionCookie } from "../../../../lib/auth-core";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(
      new URL("/app/sign-in?error=Missing+sign-in+token", request.url),
    );
  }

  try {
    const sessionToken = await exchangeMagicLink(token);
    const response = NextResponse.redirect(
      new URL("/app/dashboard", request.url),
    );
    response.headers.append(
      "Set-Cookie",
      sessionCookie(sessionToken, request.nextUrl.protocol === "https:"),
    );
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sign-in link failed.";
    return NextResponse.redirect(
      new URL(
        `/app/sign-in?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}
