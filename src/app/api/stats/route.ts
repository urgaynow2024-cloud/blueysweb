import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ returningClients: 0 });
  }

  const { data, error } = await supabaseAdmin
    .from("commission_submissions")
    .select("discord, name, status, hidden")
    .eq("status", "approved")
    .eq("hidden", false);

  if (error) {
    return NextResponse.json({ returningClients: 0 });
  }

  // Count unique customers (by Discord, falling back to name) with 2+ completed commissions.
  const counts = new Map<string, number>();
  for (const row of data || []) {
    const key = (row.discord && String(row.discord).trim()) || (row.name && String(row.name).trim());
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  let returning = 0;
  for (const c of counts.values()) {
    if (c >= 2) returning += 1;
  }

  return NextResponse.json({ returningClients: returning });
}
