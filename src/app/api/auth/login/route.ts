import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  signSession,
  verifyPassword,
  OWNER_USERNAME,
  DEFAULT_OWNER_PASSWORD,
  ownerPermissions,
  isModeratorTableRow,
  SESSION_COOKIE,
  type SessionUser,
} from "@/lib/auth";

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
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Owner signs in with the master password (never stored in the DB).
    if (username === OWNER_USERNAME) {
      if (password !== DEFAULT_OWNER_PASSWORD) {
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
