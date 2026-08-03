import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const body = await request.json();
    const { enabled, message, allowed_ips } = body;
    const { data, error } = await supabaseAdmin
      .from("maintenance_mode")
      .upsert({ id: (await supabaseAdmin.from("maintenance_mode").select("id").limit(1).single()).data?.id, enabled, message: message || "", allowed_ips: allowed_ips || [] })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || {});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
