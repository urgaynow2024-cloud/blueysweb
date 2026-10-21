import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";

/**
 * Admin read endpoint for the "What I Won't Do" editor.
 *
 * Unlike the public route this returns every category and every item,
 * including unpublished ones, because the admin panel has to be able to see
 * and re-publish a hidden line. It is gated on a valid admin session.
 */
export async function GET() {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;

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
      .order("sort_order", { ascending: true }),
  ]);

  if (categoriesResult.error) {
    console.error("Failed to load wont_do_categories:", categoriesResult.error);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
  if (itemsResult.error) {
    console.error("Failed to load wont_do_items:", itemsResult.error);
    return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
  }

  return NextResponse.json({
    categories: categoriesResult.data ?? [],
    items: itemsResult.data ?? [],
  });
}
