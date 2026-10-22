export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { buildPublicTree } from "@/lib/wont-do/tree";

/**
 * Public read endpoint for the "What I Won't Do" page.
 *
 * Only published items are returned, and a category with no published items
 * is dropped, so an empty or fully unpublished category can never show up as
 * a bare heading on the public page.
 *
 * This route is intentionally unauthenticated: it is the same data the public
 * page renders. Nothing here exposes drafts.
 */
export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const [categoriesResult, itemsResult] = await Promise.all([
    supabaseAdmin
      .from("wont_do_categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabaseAdmin
      .from("wont_do_items")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (categoriesResult.error) {
    console.error("Failed to load wont_do_categories:", categoriesResult.error);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
  if (itemsResult.error) {
    console.error("Failed to load wont_do_items:", itemsResult.error);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }

  return NextResponse.json({
    categories: buildPublicTree(categoriesResult.data ?? [], itemsResult.data ?? []),
  });
}

