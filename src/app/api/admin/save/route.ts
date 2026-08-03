import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

type AdminClient = SupabaseClient<any, "public", "public", any, any>;

async function upsertTable(table: string, items: any[], admin: AdminClient) {
  if (!items || items.length === 0) return;
  for (const item of items) {
    await admin.from(table).upsert({ ...item, id: item.id || undefined });
  }
}

async function createBackup(admin: AdminClient, label: string, data: any) {
  try {
    await admin.from("content_backups").insert([{ label, data }]);
  } catch (e) {
    console.error("Backup failed:", e);
  }
}

async function createTosVersion(admin: AdminClient, tosSections: any[]) {
  try {
    const { data: existing } = await admin.from("tos_versions").select("version_number").order("version_number", { ascending: false }).limit(1);
    const nextVersion = existing && existing.length > 0 ? existing[0].version_number + 1 : 1;
    await admin.from("tos_versions").insert([{ version_number: nextVersion, snapshot: tosSections, changed_by: "admin", change_summary: "Updated via admin panel" }]);
  } catch (e) {
    console.error("TOS version creation failed:", e);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      site,
      pricing,
      faq,
      workflow,
      reviews,
      socialLinks,
      hero,
      stats,
      services,
      beforeOrdering,
      tosSections,
      navigation,
      websiteSettings,
      portfolioCategories,
      commissionForm,
      mediaLibrary,
      homepageSections,
      commissions,
      notifications,
      maintenanceMode,
      changelog,
      roles,
      fbxMashups,
    } = data;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const admin = supabaseAdmin as AdminClient;
    const timestamp = new Date().toISOString();
    await createBackup(admin, `pre-save-${timestamp}`, data);

    const siteRows = Object.entries(site || {}).map(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        return { key, value: JSON.stringify(value) };
      }
      return { key, value: String(value) };
    });
    await admin.from("site_config").upsert(siteRows, { onConflict: "key" });

    if (pricing && pricing.length > 0) {
      await admin.from("pricing_tiers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("pricing_tiers", pricing, admin);
    }

    if (faq && faq.length > 0) {
      await admin.from("faq_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("faq_items", faq, admin);
    }

    if (workflow && workflow.length > 0) {
      await admin.from("workflow_steps").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("workflow_steps", workflow, admin);
    }

    if (reviews && reviews.length > 0) {
      await admin.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("reviews", reviews, admin);
    }

    if (socialLinks && socialLinks.length > 0) {
      await admin.from("social_links").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("social_links", socialLinks, admin);
    }

    if (hero && hero.length > 0) {
      await admin.from("hero_content").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("hero_content", hero, admin);
    }

    if (stats && stats.length > 0) {
      await admin.from("homepage_stats").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("homepage_stats", stats, admin);
    }

    if (services && services.length > 0) {
      await admin.from("services").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("services", services, admin);
    }

    if (beforeOrdering && beforeOrdering.length > 0) {
      await admin.from("before_ordering_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("before_ordering_items", beforeOrdering, admin);
    }

    if (tosSections && tosSections.length > 0) {
      await admin.from("tos_sections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("tos_sections", tosSections, admin);
      await createTosVersion(admin, tosSections);
    }

    if (navigation && navigation.length > 0) {
      await admin.from("navigation_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("navigation_items", navigation, admin);
    }

    if (websiteSettings && Object.keys(websiteSettings).length > 0) {
      const settingsRows = Object.entries(websiteSettings).map(([key, value]) => ({ key, value: String(value) }));
      await admin.from("website_settings").upsert(settingsRows, { onConflict: "key" });
    }

    if (portfolioCategories && portfolioCategories.length > 0) {
      await admin.from("portfolio_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("portfolio_categories", portfolioCategories, admin);
    }

    if (commissionForm && commissionForm.length > 0) {
      await admin.from("commission_form_fields").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("commission_form_fields", commissionForm, admin);
    }

    if (mediaLibrary && mediaLibrary.length > 0) {
      await admin.from("media_library").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("media_library", mediaLibrary, admin);
    }

    if (homepageSections && homepageSections.length > 0) {
      await admin.from("homepage_sections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("homepage_sections", homepageSections, admin);
    }

    if (fbxMashups && fbxMashups.length > 0) {
      await admin.from("fbx_mashups").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await upsertTable("fbx_mashups", fbxMashups, admin);
    }

    await createBackup(admin, `post-save-${timestamp}`, { ...data, saved: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin save error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
