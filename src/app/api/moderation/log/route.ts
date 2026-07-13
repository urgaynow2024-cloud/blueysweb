import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize, json } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return auth.response!;

  if (!supabaseAdmin) return json({ error: "Server not configured" }, 500);

  const { data, error } = await supabaseAdmin
    .from("moderation_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return json({ error: error.message }, 500);

  return NextResponse.json({ log: data || [] });
}
