import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("site_config")
      .select("value")
      .eq("key", "nsfw_rules")
      .single();

    if (error || !data) {
      return NextResponse.json({ requirements: [], notAllowed: [], note: "" });
    }

    try {
      return NextResponse.json(JSON.parse(data.value));
    } catch {
      return NextResponse.json({ requirements: [], notAllowed: [], note: "" });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { requirements, notAllowed, note } = body;

    await supabaseAdmin.from("site_config").upsert({
      key: "nsfw_rules",
      value: JSON.stringify({ requirements: requirements || [], notAllowed: notAllowed || [], note: note || "" }),
    }, { onConflict: "key" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
