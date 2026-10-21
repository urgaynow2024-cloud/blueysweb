import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";
import { isUuid, parseItemBody } from "@/lib/wont-do/validation";

/**
 * Update or delete a single "What I Won't Do" item.
 *
 * Admin only. Updating `visible` publishes or unpublishes the line without
 * deleting it, and moving an item to another category is validated against
 * the categories table first.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid item" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseItemBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const payload = parsed.value!;
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  if (payload.category_id) {
    const { data: category, error: categoryError } = await supabaseAdmin
      .from("wont_do_categories")
      .select("id")
      .eq("id", payload.category_id)
      .maybeSingle();
    if (categoryError) {
      console.error("Failed to read wont_do_categories:", categoryError);
      return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
    }
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from("wont_do_items")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update wont_do_item:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid item" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("wont_do_items")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Failed to delete wont_do_item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
