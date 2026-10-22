export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";

export async function GET() {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;

  const env = {
    supabaseConfigured: isSupabaseConfigured,
    serviceRolePresent: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    sessionSecretPresent: Boolean(process.env.SESSION_SECRET),
    adminPasswordPresent: Boolean(process.env.ADMIN_PASSWORD),
  };

  if (!supabaseAdmin) {
    return NextResponse.json({ env, database: { ok: false, error: "supabaseAdmin not initialized" } }, { status: 500 });
  }

  const { count: catCount, error: catErr } = await supabaseAdmin
    .from("wont_do_categories")
    .select("*", { count: "exact", head: true });
  const { count: itemCount, error: itemErr } = await supabaseAdmin
    .from("wont_do_items")
    .select("*", { count: "exact", head: true });

  if (catErr || itemErr) {
    return NextResponse.json({ env, database: { ok: false, categoriesError: catErr?.message, itemsError: itemErr?.message } }, { status: 500 });
  }

  return NextResponse.json({ env, database: { ok: true, categories: catCount ?? 0, items: itemCount ?? 0 } });
}

