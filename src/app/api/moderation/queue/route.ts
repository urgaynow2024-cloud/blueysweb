import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize, json } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return auth.response!;

  if (!supabaseAdmin) return json({ error: "Server not configured" }, 500);

  const [{ data: reviews }, { data: submissions }] = await Promise.all([
    supabaseAdmin
      .from("reviews")
      .select("*")
      .or("status.eq.pending,hidden.eq.true")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("commission_submissions")
      .select("*")
      .or("status.eq.pending,hidden.eq.true")
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    reviews: reviews || [],
    submissions: submissions || [],
  });
}
