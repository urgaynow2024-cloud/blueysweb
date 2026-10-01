import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  signSession,
  verifyPassword,
  safeCompare,
  isSecretConfigured,
  OWNER_USERNAME,
  DEFAULT_OWNER_PASSWORD,
  ownerPermissions,
  isModeratorTableRow,
  SESSION_COOKIE,
  type SessionUser,
} from "@/lib/auth";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

/**
 * Rate limiting notes.
 *
 * This in-memory Map is per serverless instance, so on Vercel it only limits an
 * attacker who keeps hitting the same warm instance. It is a useful first line
 * of defence but is NOT a complete control.
 *
 * A stronger, still stack-native option is to record failed attempts in
 * Supabase (a `login_attempts` table keyed by IP hash) so the limit is shared
 * across every instance. That requires a schema addition and has deliberately
 * NOT been done here, because it needs a migration and Bluey's approval.
 * Recommended as a follow-up.
 */
const attempts = new Map<string, { count: number; lockedUntil: number | null }>();

function checkRateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const record = attempts.get(ip);
  if (!record) return { ok: true };
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return { ok: false, retryAfter: Math.ceil((record.lockedUntil - Date.now()) / 1000) };
  }
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
    record.count = 0;
    return { ok: false, retryAfter: Math.ceil(LOCKOUT_MS / 1000) };
  }
  return { ok: true };
}

function recordFailure(ip: string) {
  const record = attempts.get(ip) || { count: 0, lockedUntil: null };
  record.count++;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  attempts.set(ip, record);
}

function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function POST(req: NextRequest) {
  // Fail closed with a clear server-side error rather than attempting to sign
  // a session with a default secret.
  if (!isSecretConfigured()) {
    console.error("Login rejected: SESSION_SECRET and SUPABASE_SERVICE_ROLE_KEY are both unset.");
    return NextResponse.json(
      { error: "Server is not configured for authentication" },
      { status: 500 },
    );
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.ok) {
      const res = NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
      res.headers.set("Retry-After", String(rateCheck.retryAfter));
      return res;
    }

    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    if (username === OWNER_USERNAME) {
      if (!safeCompare(password, DEFAULT_OWNER_PASSWORD)) {
        recordFailure(ip);
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const user: SessionUser = {
        id: "owner",
        username: OWNER_USERNAME,
        name: "Owner",
        role: "owner",
        perms: ownerPermissions(),
      };
      const res = NextResponse.json({ ok: true, user });
      res.cookies.set(SESSION_COOKIE, signSession(user), cookieOpts());
      return res;
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("moderators")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error || !data || !verifyPassword(password, data.password_hash)) {
      recordFailure(ip);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = isModeratorTableRow(data);
    const res = NextResponse.json({ ok: true, user });
    res.cookies.set(SESSION_COOKIE, signSession(user), cookieOpts());
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}