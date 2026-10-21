import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";
import { isUuid, parseCategoryBody } from "@/lib/wont-do/validation";

/**
 * Update or delete a single "What I Won't Do" category.
 *
 * Admin only. The id is validated as a UUID before it is used in a query, and
 * only the fields present in the body are written.
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
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseCategoryBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const payload = parsed.value!;
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("wont_do_categories")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update wont_do_category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ category: data });
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
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // Remove the items first so the delete works even if the table was created
  // without ON DELETE CASCADE.
  const { error: itemsError } = await supabaseAdmin
    .from("wont_do_items")
    .delete()
    .eq("category_id", id);
  if (itemsError) {
    console.error("Failed to delete wont_do_items:", itemsError);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }

  const { error } = await supabaseAdmin
    .from("wont_do_categories")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Failed to delete wont_do_category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
