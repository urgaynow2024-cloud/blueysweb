import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requirePermission, json } from "@/lib/auth/guard";
import { type Permission } from "@/lib/auth/permissions";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePermission("reviews" as Permission);
  if (!guard.ok) return guard.response!;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, display_name, review_text, rating, hidden, image_url } = body;

    if (!supabaseAdmin) {
      return json({ error: "Server not configured" }, 500);
    }

    const updates: Record<string, unknown> = {};
    if (typeof status === "string") updates.status = status;
    if (typeof display_name === "string") updates.display_name = display_name;
    if (typeof review_text === "string") updates.review_text = review_text;
    if (typeof rating === "number") updates.rating = rating;
    if (typeof hidden === "boolean") updates.hidden = hidden;
    if (typeof image_url === "string") updates.image_url = image_url;

    if (Object.keys(updates).length === 0) {
      return json({ error: "No valid fields to update" }, 400);
    }

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Review update error:", error);
      return json({ error: "Failed to update review", details: error.message }, 500);
    }

    if (!data) {
      return json({ error: "Review not found" }, 404);
    }

    return NextResponse.json({ success: true, review: data });
  } catch (error) {
    console.error("Review PATCH error:", error);
    return json({ error: "Invalid request" }, 400);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePermission("reviews" as Permission);
  if (!guard.ok) return guard.response!;

  try {
    const { id } = await params;

    if (!supabaseAdmin) {
      return json({ error: "Server not configured" }, 500);
    }

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Review delete error:", error);
      return json({ error: "Failed to delete review", details: error.message }, 500);
    }

    if (!data) {
      return json({ error: "Review not found" }, 404);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review DELETE error:", error);
    return json({ error: "Invalid request" }, 400);
  }
}