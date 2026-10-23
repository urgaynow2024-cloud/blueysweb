import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const REQUIRED_TABLES: Record<string, string[]> = {
  adoptables: ["id", "title", "description", "category", "price", "availability", "featured", "visible", "sort_order", "species", "included_items", "rules_license", "vrchat_info", "sfw_price", "nsfw_price", "bundle_price", "sfw_price_usd", "nsfw_price_usd", "bundle_price_usd", "sfw_available", "nsfw_available", "bundle_available", "main_image", "main_image_path"],
  adoptable_gallery: ["id", "adoptable_id", "url", "storage_path", "path", "sort_order", "is_nsfw"],
  adoptable_before_after: ["id", "adoptable_id", "before_url", "after_url", "before_path", "after_path", "label", "sort_order"],
  credits: ["id", "name", "description", "categories", "avatar_url", "avatar_path", "website_url", "discord_url", "social_links", "note", "featured", "visible", "sort_order"],
  portfolio_images: ["id", "url", "path", "sort_order"],
  nsfw_portfolio_images: ["id", "url", "path", "sort_order"],
  site_images: ["key", "url", "path"],
  reviews: ["id", "display_name", "rating", "review_text", "status", "image_url", "hidden"],
};

/**
 * Statuses the adoptable lifecycle supports. The CHECK constraint in
 * supabase/schema.sql has to allow all of them; a deployment that has not run
 * the lifecycle migration will reject pending/hidden writes, which is why the
 * list is reported alongside the column check.
 */
const ADOPTABLE_STATUSES = ["available", "pending", "reserved", "sold", "hidden"];

/**
 * Checks one table with a handful of round-trips instead of one
 * per column.
 *
 * The previous implementation ran `select * limit 1` and then a
 * separate `select <column> limit 1` for EVERY required column —
 * 24 for the adoptables table, roughly 100 queries in total — on
 * every single dashboard load. That serialised the whole admin
 * page behind the health check.
 *
 * This version requests every required column in a single query
 * and, when PostgREST reports a missing column, drops it and
 * retries. A typical healthy table costs exactly one query; a
 * drifted table costs one query per missing column. All tables
 * are checked in parallel, so the worst case is bounded by the
 * slowest table rather than the sum of every column.
 */
async function checkTable(
  table: string,
  columns: string[],
): Promise<{ exists: boolean; missingColumns: string[] }> {
  let remaining = [...columns];
  const missing: string[] = [];

  for (let attempt = 0; attempt <= columns.length; attempt++) {
    if (remaining.length === 0) {
      return { exists: true, missingColumns: columns };
    }

    const { error } = await supabaseAdmin!
      .from(table)
      .select(remaining.join(","))
      .limit(1);

    if (!error) {
      return { exists: true, missingColumns: missing };
    }

    const msg = error.message || "";

    // The table itself is gone — nothing to inspect further.
    if (/relation .* does not exist/i.test(msg)) {
      return { exists: false, missingColumns: columns };
    }

    // PostgREST names the offending column:
    // "Could not find the 'foo' column of 'public.adoptables'"
    const match = msg.match(/Could not find the '(\w+)' column/);
    if (!match) {
      // An error we cannot attribute to a column (permissions,
      // network, RLS). Report the table as present and healthy
      // rather than alarming the owner with a false schema error.
      return { exists: true, missingColumns: [] };
    }

    const absent = match[1];
    missing.push(absent);
    remaining = remaining.filter((col) => col !== absent);
  }

  return { exists: true, missingColumns: missing };
}

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ healthy: false, error: "Server not configured" });
  }

  const results: Record<string, { exists: boolean; missingColumns: string[] }> = {};

  const checks = await Promise.all(
    Object.entries(REQUIRED_TABLES).map(async ([table, columns]) => {
      try {
        return [table, await checkTable(table, columns)] as const;
      } catch {
        return [table, { exists: false, missingColumns: columns }] as const;
      }
    }),
  );

  let allHealthy = true;
  for (const [table, result] of checks) {
    results[table] = result;
    if (!result.exists || result.missingColumns.length > 0) {
      allHealthy = false;
    }
  }

  return NextResponse.json({ healthy: allHealthy, tables: results, adoptableStatuses: ADOPTABLE_STATUSES });
}
