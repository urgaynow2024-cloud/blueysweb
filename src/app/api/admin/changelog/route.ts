import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const { data, error } = await supabaseAdmin.from("changelog_entries").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch changelog" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const body = await request.json();
    const { data, error } = await supabaseAdmin.from("changelog_entries").insert([body]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data?.[0] || {});
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
