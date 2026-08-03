import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const { data, error } = await supabaseAdmin.from("moderators").select("*").order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const sanitized = (data || []).map(({ password_hash, ...rest }: any) => rest);
    return NextResponse.json(sanitized);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch moderators" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const body = await request.json();
    const { data, error } = await supabaseAdmin.from("moderators").insert([body]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { password_hash, ...rest } = data?.[0] || {};
    return NextResponse.json(rest || {});
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
