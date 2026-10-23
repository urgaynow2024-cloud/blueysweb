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
 * Rate limiting using Supabase for distributed rate limiting across Vercel instances.
 * Falls back to in-memory Map if Supabase is unavailable.
 */
const memoryAttempts = new Map<string, { count: number; lockedUntil: number | null }>();

function hashIP(ip: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }
  const vercelIP = req.headers.get("x-vercel-forwarded-for");
  if (vercelIP) {
    return vercelIP.split(",")[0].trim();
  }
  return "unknown";
}

async function checkRateLimitSupabase(ipHash: string): Promise<{ ok: boolean; retryAfter?: number }> {
  if (!supabaseAdmin) {
    return checkRateLimitMemory(ipHash);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("login_attempts")
      .select("*")
      .eq("ip_hash", ipHash)
      .maybeSingle();

    if (error) {
      console.error("Rate limit check error:", error);
      return checkRateLimitMemory(ipHash);
    }

    if (!data) {
      return { ok: true };
    }

    const now = new Date();
    if (data.locked_until && new Date(data.locked_until) > now) {
      const retryAfter = Math.ceil((new Date(data.locked_until).getTime() - now.getTime()) / 1000);
      return { ok: false, retryAfter };
    }

    if (data.attempt_count >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(now.getTime() + LOCKOUT_MS);
      await supabaseAdmin
        .from("login_attempts")
        .update({ attempt_count: 0, locked_until: lockedUntil.toISOString(), updated_at: now.toISOString() })
        .eq("ip_hash", ipHash);
      return { ok: false, retryAfter: Math.ceil(LOCKOUT_MS / 1000) };
    }

    return { ok: true };
  } catch (e) {
    console.error("Rate limit check exception:", e);
    return checkRateLimitMemory(ipHash);
  }
}

function checkRateLimitMemory(ipHash: string): { ok: boolean; retryAfter?: number } {
  const record = memoryAttempts.get(ipHash);
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

async function recordFailureSupabase(ipHash: string): Promise<void> {
  if (!supabaseAdmin) {
    recordFailureMemory(ipHash);
    return;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("login_attempts")
      .select("*")
      .eq("ip_hash", ipHash)
      .maybeSingle();

    if (error) {
      console.error("Record failure select error:", error);
      recordFailureMemory(ipHash);
      return;
    }

    const now = new Date();
    if (!data) {
      const { error: insertError } = await supabaseAdmin
        .from("login_attempts")
        .insert({ ip_hash: ipHash, attempt_count: 1, created_at: now.toISOString(), updated_at: now.toISOString() });
      if (insertError) {
        console.error("Record failure insert error:", insertError);
        recordFailureMemory(ipHash);
      }
      return;
    }

    const newCount = data.attempt_count + 1;
    if (newCount >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(now.getTime() + LOCKOUT_MS);
      const { error: updateError } = await supabaseAdmin
        .from("login_attempts")
        .update({ attempt_count: 0, locked_until: lockedUntil.toISOString(), updated_at: now.toISOString() })
        .eq("ip_hash", ipHash);
      if (updateError) {
        console.error("Record failure lock update error:", updateError);
        recordFailureMemory(ipHash);
      }
    } else {
      const { error: updateError } = await supabaseAdmin
        .from("login_attempts")
        .update({ attempt_count: newCount, updated_at: now.toISOString() })
        .eq("ip_hash", ipHash);
      if (updateError) {
        console.error("Record failure count update error:", updateError);
        recordFailureMemory(ipHash);
      }
    }
  } catch (e) {
    console.error("Record failure exception:", e);
    recordFailureMemory(ipHash);
  }
}

function recordFailureMemory(ipHash: string): void {
  const record = memoryAttempts.get(ipHash) || { count: 0, lockedUntil: null };
  record.count++;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  memoryAttempts.set(ipHash, record);
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
  if (!isSecretConfigured()) {
    console.error("Login rejected: SESSION_SECRET and SUPABASE_SERVICE_ROLE_KEY are both unset.");
    return NextResponse.json(
      { error: "Server is not configured for authentication" },
      { status: 500 },
    );
  }

  try {
    const ip = getClientIP(req);
    const ipHash = hashIP(ip);

    const rateCheck = await checkRateLimitSupabase(ipHash);
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
        await recordFailureSupabase(ipHash);
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
      await recordFailureSupabase(ipHash);
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