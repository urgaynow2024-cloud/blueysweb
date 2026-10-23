import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession, requirePermission } from "@/lib/auth/guard";
import { createAdoptable } from "@/lib/adoptables/server";

export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // `?scope=public` applies the public lifecycle rules and stays open, so the
  // public site can be debugged without credentials. The unscoped listing
  // includes HIDDEN adoptables and is therefore admin-only.
  const scope = new URL(request.url).searchParams.get("scope");

  if (scope === "public") {
    const { data, error } = await supabaseAdmin
      .from("adoptables")
      .select("*")
      .eq("visible", true)
      .neq("availability", "hidden")
      .order("sort_order", { ascending: true });
    if (error) {
      return NextResponse.json({ error: "Failed to load adoptables" }, { status: 500 });
    }
    return NextResponse.json(data || []);
  }

  // Admin access requires adoptables permission
  const auth = await requirePermission("adoptables");
  if (!auth.ok) return auth.response!;

  const { data, error } = await supabaseAdmin
    .from("adoptables")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to load adoptables" }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const auth = await requirePermission("adoptables");
  if (!auth.ok) return auth.response!;

  try {
    const body = await request.json();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const result = await createAdoptable(body ?? {});
    if (result.error || !result.row) {
      return NextResponse.json(
        { error: result.error || "Failed to create adoptable" },
        { status: 500 },
      );
    }
    return NextResponse.json(result.row, { status: 201 });
  } catch (error: any) {
    console.error("Adoptable create error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/**
 * Permanently removes every adoptable, gallery row, comparison and storage
 * object. This is intentionally not exposed to the admin UI's primary controls
 * — the UI requires a typed confirmation first — and it is authenticated.
 */
export async function DELETE() {
  const auth = await requirePermission("adoptables");
  if (!auth.ok) return auth.response!;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const [gallery, beforeAfter, adoptables] = await Promise.all([
    supabaseAdmin.from("adoptable_gallery").select("path, storage_path"),
    supabaseAdmin.from("adoptable_before_after").select("before_path, after_path"),
    supabaseAdmin.from("adoptables").select("id, main_image_path"),
  ]);

  const paths = new Set<string>();
  const addPath = (value: string | null | undefined) => {
    if (!value) return;
    const cleaned = value.replace(/^\/+/, "");
    if (cleaned && !/^https?:\/\//i.test(cleaned)) paths.add(cleaned);
  };
  for (const img of gallery.data ?? []) {
    addPath(img.path);
    addPath(img.storage_path);
  }
  for (const ba of beforeAfter.data ?? []) {
    addPath(ba.before_path);
    addPath(ba.after_path);
  }
  for (const row of adoptables.data ?? []) addPath(row.main_image_path);

  if (paths.size > 0) {
    await supabaseAdmin.storage.from("portfolio-images").remove([...paths]);
  }

  await supabaseAdmin.from("adoptable_before_after").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabaseAdmin.from("adoptable_gallery").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await supabaseAdmin
    .from("adoptables")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    return NextResponse.json({ error: "Failed to clear adoptables" }, { status: 500 });
  }
  return NextResponse.json({ success: true, removedStorageObjects: paths.size });
}
