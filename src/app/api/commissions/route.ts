import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { DEFAULT_OWNER_PASSWORD } from "@/lib/auth";

export async function GET() {
  if (!isSupabaseConfigured || !supabase) return NextResponse.json([]);
  const { data, error } = await supabase.from("commissions").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured || !supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  
  if (request.headers.get("x-admin-password") !== DEFAULT_OWNER_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = await supabase.from("commissions").insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] || null);
}
