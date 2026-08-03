import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured || !supabase) return NextResponse.json([]);
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured || !supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const body = await request.json();
  const { data, error } = await supabase.from("notifications").insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] || null);
}
