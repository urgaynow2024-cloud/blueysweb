import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_request: Request, { params }: { params: Promise<{ versionId: string }> }) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const { versionId } = await params;
  const { data, error } = await supabaseAdmin.from("tos_versions").select("*").eq("id", versionId).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || {});
}

export async function POST(_request: Request, { params }: { params: Promise<{ versionId: string }> }) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const { versionId } = await params;
    const { data: version, error } = await supabaseAdmin.from("tos_versions").select("*").eq("id", versionId).single();
    if (error || !version) return NextResponse.json({ error: "Version not found" }, { status: 404 });
    const snapshot = version.snapshot as unknown as Record<string, unknown>[];
    await supabaseAdmin.from("tos_sections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    for (const item of snapshot) {
      const { id, ...rest } = item as Record<string, unknown>;
      await supabaseAdmin.from("tos_sections").insert([{ ...rest, id: id as string | undefined }]);
    }
    const { data: existing } = await supabaseAdmin.from("tos_versions").select("version_number").order("version_number", { ascending: false }).limit(1);
    const nextVersion = existing && existing.length > 0 ? existing[0].version_number + 1 : 1;
    await supabaseAdmin.from("tos_versions").insert([{ version_number: nextVersion, snapshot, changed_by: "admin", change_summary: `Restored from version ${version.version_number}` }]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Restore failed" }, { status: 500 });
  }
}
