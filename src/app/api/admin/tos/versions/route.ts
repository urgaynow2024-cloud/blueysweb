import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const { data, error } = await supabaseAdmin.from("tos_versions").select("*").order("version_number", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const body = await request.json();
    const { version_number, snapshot, changed_by, change_summary } = body;
    if (!version_number || !snapshot) return NextResponse.json({ error: "version_number and snapshot required" }, { status: 400 });
    const { data, error } = await supabaseAdmin.from("tos_versions").insert([{ version_number, snapshot, changed_by: changed_by || "admin", change_summary: change_summary || "" }]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data?.[0] || {});
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
