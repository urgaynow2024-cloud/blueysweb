import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize, hashPassword, json, PERMISSION_LIST, type Permission } from "@/lib/auth";

function sanitize(row: any) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return rest;
}

function parsePermissions(input: any): Record<Permission, boolean> | null {
  if (!input || typeof input !== "object") return null;
  const out = {} as Record<Permission, boolean>;
  for (const p of PERMISSION_LIST) {
    out[p.key] = Boolean(input[p.key]);
  }
  return out;
}

export async function GET(req: NextRequest) {
  const auth = authorize(req, { role: "owner" });
  if (!auth.ok) return auth.response!;

  if (!supabaseAdmin) return json({ error: "Server not configured" }, 500);

  const { data, error } = await supabaseAdmin
    .from("moderators")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);

  return NextResponse.json({ moderators: (data || []).map(sanitize) });
}

export async function POST(req: NextRequest) {
  const auth = authorize(req, { role: "owner" });
  if (!auth.ok) return auth.response!;

  if (!supabaseAdmin) return json({ error: "Server not configured" }, 500);

  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const displayName = String(body.display_name || "").trim() || username;
  const permissions = parsePermissions(body.permissions);

  if (username.toLowerCase() === "owner") return json({ error: "That username is reserved" }, 400);
  if (username.length < 3) return json({ error: "Username must be at least 3 characters" }, 400);
  if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);
  if (!permissions) return json({ error: "Invalid permissions" }, 400);

  const { data: existing } = await supabaseAdmin
    .from("moderators")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (existing) return json({ error: "That username is already taken" }, 409);

  const { data, error } = await supabaseAdmin
    .from("moderators")
    .insert([
      {
        username,
        password_hash: hashPassword(password),
        display_name: displayName,
        role: "moderator",
        permissions,
        created_by: auth.session!.name,
      },
    ])
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);

  return NextResponse.json({ moderator: sanitize(data) }, { status: 201 });
}
