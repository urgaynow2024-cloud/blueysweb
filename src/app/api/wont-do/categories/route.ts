import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";
import { parseCategoryBody } from "@/lib/wont-do/validation";
import { nextSortOrder } from "@/lib/wont-do/tree";

/**
 * Create a category for the "What I Won't Do" page.
 *
 * Admin only. The body is validated before it reaches the database, and
 * unknown fields are dropped by the parser rather than written.
 */
export async function POST(request: Request) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseCategoryBody(body, { requireTitle: true });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  let sortOrder = parsed.value!.sort_order;
  if (sortOrder === undefined) {
    const { data: existing, error } = await supabaseAdmin
      .from("wont_do_categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    if (error) {
      console.error("Failed to read wont_do_categories:", error);
      return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
    sortOrder = nextSortOrder(existing ?? []);
  }

  const { data, error } = await supabaseAdmin
    .from("wont_do_categories")
    .insert({
      title: parsed.value!.title,
      description: parsed.value!.description ?? "",
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create wont_do_category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }

  return NextResponse.json({ category: data }, { status: 201 });
}
