import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";
import { parseItemBody } from "@/lib/wont-do/validation";
import { nextSortOrder } from "@/lib/wont-do/tree";

/**
 * Create an item for the "What I Won't Do" page.
 *
 * Admin only. The category has to exist, otherwise the foreign key would
 * reject the insert with an opaque database error.
 */
export async function POST(request: Request) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseItemBody(body, { requireTitle: true });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (!parsed.value!.category_id) {
    return NextResponse.json({ error: "A category is required" }, { status: 400 });
  }

  const { data: category, error: categoryError } = await supabaseAdmin
    .from("wont_do_categories")
    .select("id")
    .eq("id", parsed.value!.category_id)
    .maybeSingle();
  if (categoryError) {
    console.error("Failed to read wont_do_categories:", categoryError);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  let sortOrder = parsed.value!.sort_order;
  if (sortOrder === undefined) {
    const { data: existing, error } = await supabaseAdmin
      .from("wont_do_items")
      .select("sort_order")
      .eq("category_id", parsed.value!.category_id)
      .order("sort_order", { ascending: false })
      .limit(1);
    if (error) {
      console.error("Failed to read wont_do_items:", error);
      return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }
    sortOrder = nextSortOrder(existing ?? []);
  }

  const { data, error } = await supabaseAdmin
    .from("wont_do_items")
    .insert({
      category_id: parsed.value!.category_id,
      title: parsed.value!.title,
      description: parsed.value!.description ?? "",
      sort_order: sortOrder,
      visible: parsed.value!.visible ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create wont_do_item:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
