import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize, json, type SessionUser } from "@/lib/auth";

/**
 * Submitting an adoptable draft for owner review.
 *
 * A moderator with Adoptables Management can create and edit drafts, but the
 * lifecycle decisions — publishing, selling, hiding, deleting — belong to the
 * owner. This route is the handoff point: it records the submission in the
 * moderation log and returns the adoptable's current state so the owner can
 * review it from the same dashboard.
 *
 * It does NOT change the adoptable's status. The owner still has to open the
 * editor and publish it, which keeps the two actions firmly separate.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!id) {
    return json({ error: "Adoptable id is required" }, 400);
  }

  const auth = authorize(req, { perm: "adoptables" });
  if (!auth.ok) return auth.response!;
  const actor = auth.session!;

  if (!supabaseAdmin) {
    return json({ error: "Server not configured" }, 500);
  }

  const { data: row, error: fetchError } = await supabaseAdmin
    .from("adoptables")
    .select("id, title, availability, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return json({ error: "Failed to fetch adoptable" }, 500);
  if (!row) return json({ error: "Adoptable not found" }, 404);

  await logSubmission(actor, row.id, row.title, note);

  return NextResponse.json({
    ok: true,
    adoptable: {
      id: row.id,
      title: row.title,
      availability: row.availability,
      updated_at: row.updated_at,
    },
    submittedBy: actor.name,
    submittedAt: new Date().toISOString(),
  });
}

async function logSubmission(
  actor: SessionUser,
  adoptableId: string,
  title: string | null,
  note: string,
) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("moderation_log").insert([
    {
      actor_id: actor.id,
      actor_name: actor.name,
      actor_role: actor.role,
      action: "submit_adoptable_for_review",
      entity_type: "adoptable",
      entity_id: adoptableId,
      entity_label: title || "Untitled adoptable",
      reason: note || null,
    },
  ]);
}