import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const items = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    for (const item of items) {
      const { error } = await supabaseAdmin
        .from("portfolio_images")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id);

      if (error) {
        console.error("Reorder error:", error);
        return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
