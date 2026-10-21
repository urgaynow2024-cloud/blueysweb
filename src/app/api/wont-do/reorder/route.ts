import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";
import { parseReorderBody } from "@/lib/wont-do/validation";

/**
 * Persist a new ordering for categories and items.
 *
 * Admin only. The client sends the ids in display order; the server rewrites
 * `sort_order` so the stored order matches. Item ordering is per category, so
 * moving an item between categories cannot leave gaps behind.
 */
export async function POST(request: Request) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const db = supabaseAdmin;

  const body = await request.json().catch(() => null);
  const parsed = parseReorderBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { categories, items } = parsed.value!;
  const now = new Date().toISOString();

  if (categories.length > 0) {
    const { data: known, error } = await db
      .from("wont_do_categories")
      .select("id")
      .in("id", categories);
    if (error) {
      console.error("Failed to read wont_do_categories:", error);
      return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
    }
    const knownIds = new Set((known ?? []).map((row) => row.id));
    if (knownIds.size !== categories.length) {
      return NextResponse.json({ error: "Unknown category in order" }, { status: 400 });
    }

    const results = await Promise.all(
      categories.map((id, index) =>
        db
      .from("wont_do_categories")
          .update({ sort_order: index, updated_at: now })
          .eq("id", id)
      )
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      console.error("Failed to update wont_do_categories order:", failed.error);
      return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
    }
  }

  if (items.length > 0) {
    const { data: known, error } = await db
      .from("wont_do_items")
      .select("id, category_id")
      .in("id", items);
    if (error) {
      console.error("Failed to read wont_do_items:", error);
      return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
    }
    const rows = known ?? [];
    if (rows.length !== items.length) {
      return NextResponse.json({ error: "Unknown item in order" }, { status: 400 });
    }

    const categoryOf = new Map(rows.map((row) => [row.id, row.category_id]));
    const counters = new Map<string, number>();

    const results = await Promise.all(
      items.map((id) => {
        const categoryId = categoryOf.get(id)!;
        const next = counters.get(categoryId) ?? 0;
        counters.set(categoryId, next + 1);
        return db
      .from("wont_do_items")
          .update({ sort_order: next, updated_at: now })
          .eq("id", id);
      })
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      console.error("Failed to update wont_do_items order:", failed.error);
      return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
