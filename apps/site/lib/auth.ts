import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createOpaqueToken,
  hashToken,
  normalizeEmail,
  SESSION_COOKIE,
} from "./auth-core";
import { db } from "./database";

export type AppUser = {
  id: string;
  email: string;
};

export async function requestMagicLink(
  rawEmail: string,
  origin: string,
): Promise<{ developmentUrl?: string }> {
  const email = normalizeEmail(rawEmail);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  const token = createOpaqueToken();
  const tokenHash = await hashToken(token);
  const sql = db();
  await sql`
    INSERT INTO magic_links (id, email, token_hash, expires_at)
    VALUES (
      ${crypto.randomUUID()},
      ${email},
      ${tokenHash},
      NOW() + INTERVAL '15 minutes'
    )
  `;

  const verifyUrl = new URL("/app/auth/verify", origin);
  verifyUrl.searchParams.set("token", token);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSJACK_EMAIL_FROM;

  if (apiKey && from) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Sign in to Newsjack Web",
        html: `<p>Open this one-time link to sign in:</p><p><a href="${escapeHtml(verifyUrl.toString())}">Sign in to Newsjack Web</a></p><p>This link expires in 15 minutes.</p>`,
      }),
    });
    if (!response.ok) {
      throw new Error(`Email provider returned ${response.status}.`);
    }
    return {};
  }

  if (
    process.env.NODE_ENV !== "production" ||
    process.env.NEWSJACK_DEMO_MODE === "1"
  ) {
    console.info(`Development magic link for ${email}: ${verifyUrl}`);
    return { developmentUrl: verifyUrl.toString() };
  }

  throw new Error(
    "Email delivery is not configured. Set RESEND_API_KEY and NEWSJACK_EMAIL_FROM.",
  );
}

export async function exchangeMagicLink(token: string): Promise<string> {
  const tokenHash = await hashToken(token);
  const sql = db();
  const links = await sql`
    UPDATE magic_links
    SET used_at = NOW()
    WHERE token_hash = ${tokenHash}
      AND used_at IS NULL
      AND expires_at > NOW()
    RETURNING email
  `;
  const email = links[0]?.email;
  if (typeof email !== "string") {
    throw new Error("This sign-in link is invalid or expired.");
  }

  const userId = crypto.randomUUID();
  const users = await sql`
    INSERT INTO app_users (id, email)
    VALUES (${userId}, ${email})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
  `;
  const sessionToken = createOpaqueToken();
  await sql`
    INSERT INTO app_sessions (id, user_id, token_hash, expires_at)
    VALUES (
      ${crypto.randomUUID()},
      ${users[0].id},
      ${await hashToken(sessionToken)},
      NOW() + INTERVAL '30 days'
    )
  `;
  return sessionToken;
}

export async function currentUser(): Promise<AppUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const sql = db();
  const rows = await sql`
    SELECT app_users.id, app_users.email
    FROM app_sessions
    JOIN app_users ON app_users.id = app_sessions.user_id
    WHERE app_sessions.token_hash = ${await hashToken(token)}
      AND app_sessions.expires_at > NOW()
    LIMIT 1
  `;
  const row = rows[0];
  return row && typeof row.id === "string" && typeof row.email === "string"
    ? { id: row.id, email: row.email }
    : null;
}

export async function requireUser(): Promise<AppUser> {
  const user = await currentUser();
  if (!user) {
    redirect("/app/sign-in");
  }
  return user;
}

export async function deleteCurrentSession(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) {
    await db()`DELETE FROM app_sessions WHERE token_hash = ${await hashToken(token)}`;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
