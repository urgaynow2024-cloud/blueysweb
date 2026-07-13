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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authorize(req, { role: "owner" });
  if (!auth.ok) return auth.response!;

  const { id } = await params;
  if (!supabaseAdmin) return json({ error: "Server not configured" }, 500);

  // Owners are not stored as DB rows and cannot be edited here.
  if (id === "owner") return json({ error: "Cannot modify the owner account" }, 403);

  const body = await req.json().catch(() => ({}));
  const update: any = {};

  if (body.display_name !== undefined) {
    update.display_name = String(body.display_name).trim();
  }
  if (body.permissions !== undefined) {
    const perms = parsePermissions(body.permissions);
    if (!perms) return json({ error: "Invalid permissions" }, 400);
    // Moderators can never be promoted to owner from here.
    update.permissions = perms;
  }
  if (body.password) {
    if (String(body.password).length < 6) {
      return json({ error: "Password must be at least 6 characters" }, 400);
    }
    update.password_hash = hashPassword(String(body.password));
  }

  if (Object.keys(update).length === 0) {
    return json({ error: "Nothing to update" }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from("moderators")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);

  return NextResponse.json({ moderator: sanitize(data) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authorize(req, { role: "owner" });
  if (!auth.ok) return auth.response!;

  const { id } = await params;
  if (!supabaseAdmin) return json({ error: "Server not configured" }, 500);
  if (id === "owner") return json({ error: "Cannot delete the owner account" }, 403);
  if (id === auth.session!.id) return json({ error: "You cannot remove your own account" }, 403);

  const { error } = await supabaseAdmin.from("moderators").delete().eq("id", id);
  if (error) return json({ error: error.message }, 500);

  return NextResponse.json({ ok: true });
}
