import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const { id } = await params;
    const body = await _request.json();
    const { data, error } = await supabaseAdmin.from("changelog_entries").update(body).eq("id", id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data?.[0] || {});
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from("changelog_entries").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
