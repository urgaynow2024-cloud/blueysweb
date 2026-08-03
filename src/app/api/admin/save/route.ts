import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { site, pricing, faq, workflow, reviews, socialLinks } = data;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const siteRows = Object.entries(site || {}).map(([key, value]) => ({ key, value: String(value) }));
    await supabaseAdmin.from("site_config").upsert(siteRows, { onConflict: "key" });

    await supabaseAdmin.from("pricing_tiers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (pricing && pricing.length > 0) {
      for (const item of pricing) {
        await supabaseAdmin.from("pricing_tiers").upsert({ ...item, id: item.id || undefined });
      }
    }

    await supabaseAdmin.from("faq_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (faq && faq.length > 0) {
      for (const item of faq) {
        await supabaseAdmin.from("faq_items").upsert({ ...item, id: item.id || undefined });
      }
    }

    await supabaseAdmin.from("workflow_steps").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (workflow && workflow.length > 0) {
      for (const item of workflow) {
        await supabaseAdmin.from("workflow_steps").upsert({ ...item, id: item.id || undefined });
      }
    }

    await supabaseAdmin.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (reviews && reviews.length > 0) {
      for (const item of reviews) {
        await supabaseAdmin.from("reviews").upsert({ ...item, id: item.id || undefined });
      }
    }

    await supabaseAdmin.from("social_links").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (socialLinks && socialLinks.length > 0) {
      for (const item of socialLinks) {
        await supabaseAdmin.from("social_links").upsert({ ...item, id: item.id || undefined });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin save error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
