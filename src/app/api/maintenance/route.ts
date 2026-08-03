import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured || !supabase) return NextResponse.json({ enabled: false, message: "" });
  const { data, error } = await supabase.from("maintenance_mode").select("*").limit(1).single();
  if (error || !data) return NextResponse.json({ enabled: false, message: "" });
  return NextResponse.json({ enabled: data.enabled, message: data.message || "" });
}
