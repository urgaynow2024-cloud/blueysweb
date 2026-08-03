import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const { data, error } = await supabaseAdmin.from("notification_settings").select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  try {
    const body = await request.json();
    const { settings } = body;
    if (!Array.isArray(settings)) return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
    await supabaseAdmin.from("notification_settings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    for (const setting of settings) {
      await supabaseAdmin.from("notification_settings").upsert(setting, { onConflict: "notification_type" });
    }
    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
