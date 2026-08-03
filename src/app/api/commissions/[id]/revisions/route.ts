import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("commission_revisions").select("*").eq("commission_id", id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const { id } = await params;
    const body = await _request.json();
    const { data, error } = await supabaseAdmin.from("commission_revisions").insert([{ ...body, commission_id: id }]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data?.[0] || {});
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
