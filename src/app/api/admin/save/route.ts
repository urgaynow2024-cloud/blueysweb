import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";

/**
 * Bulk "save everything" endpoint for the Founder Center.
 *
 * This route uses the Supabase service-role key, which bypasses RLS entirely,
 * and rewrites site_config, pricing_tiers, faq_items, workflow_steps, reviews,
 * social_links and tos_sections. It therefore MUST be authenticated and
 * owner-only server-side. Frontend visibility is not a security control.
 */
export async function POST(request: Request) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;
  if (guard.session?.role !== "owner") {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }

  try {
    const data = await request.json();
    const { site, pricing, faq, workflow, reviews, socialLinks, tos } = data;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }
    const db = supabaseAdmin;

    const siteRows = Object.entries(site || {}).map(([key, value]) => ({ key, value: String(value) }));
    await db.from("site_config").upsert(siteRows, { onConflict: "key" });

    // NOTE: the previous implementation deleted every row in each table and
    // then re-inserted the payload. A partial payload therefore destroyed all
    // existing records, and any error between delete and insert left the table
    // empty. Each table is now only replaced when the caller actually sent it,
    // and a failed upsert aborts the request instead of silently continuing.
    const replaceAll = async (
      table: string,
      rows: Record<string, unknown>[] | undefined,
      sent: boolean
    ) => {
      if (!sent) return;
      if (!Array.isArray(rows)) return;
      if (rows.length === 0) {
        await db.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        return;
      }
      for (const item of rows) {
        const { error } = await db
          .from(table)
          .upsert({ ...item, id: item.id || undefined });
        if (error) throw new Error(`${table} upsert failed`);
      }
    };

    await replaceAll("pricing_tiers", pricing, "pricing" in data);
    await replaceAll("faq_items", faq, "faq" in data);
    await replaceAll("workflow_steps", workflow, "workflow" in data);
    await replaceAll("reviews", reviews, "reviews" in data);
    await replaceAll("social_links", socialLinks, "socialLinks" in data);
    await replaceAll("tos_sections", tos, "tos" in data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin save error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
