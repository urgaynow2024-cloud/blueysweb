import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, display_name, review_text, rating, hidden, image_url } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof status === "string") updates.status = status;
    if (typeof display_name === "string") updates.display_name = display_name;
    if (typeof review_text === "string") updates.review_text = review_text;
    if (typeof rating === "number") updates.rating = rating;
    if (typeof hidden === "boolean") updates.hidden = hidden;
    if (typeof image_url === "string") updates.image_url = image_url;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("reviews").update(updates).eq("id", id);

    if (error) {
      console.error("Review update error:", error);
      return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review PATCH error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;

  try {
    const { id } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { error } = await supabaseAdmin.from("reviews").delete().eq("id", id);

    if (error) {
      console.error("Review delete error:", error);
      return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review DELETE error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}