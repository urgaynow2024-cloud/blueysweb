import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize, json, type Permission, type SessionUser } from "@/lib/auth";

const TABLES: Record<string, string> = {
  review: "reviews",
  submission: "commission_submissions",
};

const REQUIRED_PERM: Record<string, Record<string, Permission>> = {
  review: { approve: "reviews", reject: "reviews", hide: "hide_content", unhide: "hide_content" },
  submission: { approve: "submissions", reject: "submissions", hide: "hide_content", unhide: "hide_content" },
};

const ACTION_LABEL: Record<string, string> = {
  approve: "Approved",
  reject: "Rejected",
  hide: "Hid",
  unhide: "Unhid",
};

async function logAction(actor: SessionUser, action: string, entityType: string, entityId: string, entityLabel: string | null, reason: string | null) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("moderation_log").insert([
    {
      actor_id: actor.id,
      actor_name: actor.name,
      actor_role: actor.role,
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_label: entityLabel,
      reason: reason || null,
    },
  ]);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { type, id, action, reason } = body as {
    type?: string;
    id?: string;
    action?: string;
    reason?: string;
  };

  const table = TABLES[type || ""];
  const perm = REQUIRED_PERM[type || ""]?.[action || ""];
  if (!table || !perm) {
    return json({ error: "Invalid moderation target or action" }, 400);
  }

  const auth = authorize(req, { perm });
  if (!auth.ok) return auth.response!;
  const actor = auth.session!;

  if (!supabaseAdmin) return json({ error: "Server not configured" }, 500);

  const { data: row, error: fetchError } = await supabaseAdmin
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return json({ error: fetchError.message }, 500);
  if (!row) return json({ error: "Item not found" }, 404);

  const entityLabel =
    type === "review" ? (row.display_name as string) || "Review" : (row.name as string) || "Submission";

  const reasonText = typeof reason === "string" ? reason.trim() : "";
  if (action === "reject" && !reasonText) {
    return json({ error: "An internal reason is required when rejecting." }, 400);
  }

  const stamp = new Date().toISOString();
  const update: any = { moderated_by: actor.name, moderated_at: stamp };

  if (action === "approve") {
    update.status = "approved";
    update.hidden = false;
    update.rejected_reason = null;
  } else if (action === "reject") {
    update.status = "rejected";
    update.hidden = true;
    update.rejected_reason = reasonText;
  } else if (action === "hide") {
    update.hidden = true;
  } else if (action === "unhide") {
    update.hidden = false;
  }

  const { error: updateError } = await supabaseAdmin.from(table).update(update).eq("id", id);
  if (updateError) return json({ error: updateError.message }, 500);

  await logAction(actor, ACTION_LABEL[action!], type!, id!, entityLabel, action === "reject" ? reasonText : reasonText || null);

  return NextResponse.json({ ok: true });
}
