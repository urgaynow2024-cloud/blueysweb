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

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ healthy: false, error: "Server not configured" });
  }

  const results: Record<string, { exists: boolean; missingColumns: string[] }> = {};
  let allHealthy = true;

  for (const [table, columns] of Object.entries(REQUIRED_TABLES)) {
    try {
      const { error } = await supabaseAdmin.from(table).select("*").limit(1);

      if (error) {
        const msg = error.message || "";
        if (msg.includes("does not exist") || msg.includes("relation") && msg.includes("not found")) {
          results[table] = { exists: false, missingColumns: columns };
          allHealthy = false;
          continue;
        }
        results[table] = { exists: true, missingColumns: [] };
        continue;
      }

      const missingColumns: string[] = [];
      for (const col of columns) {
        // The client resolves with { error } rather than throwing, so the error
        // has to be inspected. Wrapping the call in try/catch alone reported
        // every column as present, which hid real schema drift.
        const { error: columnError } = await supabaseAdmin.from(table).select(col).limit(1);
        if (columnError) {
          const msg = columnError.message || "";
          if (/column|does not exist/i.test(msg)) {
            missingColumns.push(col);
          }
        }
      }

      if (missingColumns.length > 0) {
        allHealthy = false;
      }

      results[table] = { exists: true, missingColumns };
    } catch {
      results[table] = { exists: false, missingColumns: columns };
      allHealthy = false;
    }
  }

  return NextResponse.json({ healthy: allHealthy, tables: results, adoptableStatuses: ADOPTABLE_STATUSES });
}
