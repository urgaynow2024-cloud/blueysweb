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


export async function POST() {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;

  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false, error: "supabaseAdmin not initialized" }, { status: 500 });
  }

  const tempTitle = "DIAGNOSTIC-TEMP-DELETE-ME";
  const { data: created, error: createError } = await supabaseAdmin
    .from("wont_do_categories")
    .insert({ title: tempTitle, description: "diagnostic", sort_order: 9999 })
    .select()
    .single();
  if (createError || !created) {
    return NextResponse.json({ ok: false, step: "create", error: createError?.message }, { status: 500 });
  }

  const { data: readBack, error: readError } = await supabaseAdmin
    .from("wont_do_categories")
    .select("*")
    .eq("id", created.id)
    .maybeSingle();
  if (readError || !readBack) {
    await supabaseAdmin.from("wont_do_categories").delete().eq("id", created.id);
    return NextResponse.json({ ok: false, step: "read", error: readError?.message }, { status: 500 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("wont_do_categories")
    .update({ title: tempTitle + "-UPDATED" })
    .eq("id", created.id);
  if (updateError) {
    await supabaseAdmin.from("wont_do_categories").delete().eq("id", created.id);
    return NextResponse.json({ ok: false, step: "update", error: updateError.message }, { status: 500 });
  }

  const { error: deleteError } = await supabaseAdmin
    .from("wont_do_categories")
    .delete()
    .eq("id", created.id);
  if (deleteError) {
    return NextResponse.json({ ok: false, step: "delete", error: deleteError.message, leftoverId: created.id }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "create/read/update/delete succeeded" });
}
