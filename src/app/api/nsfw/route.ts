import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(request: Request) {
  try {
    const { id, path } = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    if (path) {
      await supabaseAdmin.storage.from("portfolio-images").remove([path]);
    }

    if (id) {
      const { error } = await supabaseAdmin.from("nsfw_portfolio_images").delete().eq("id", id);
      if (error) {
        console.error("NSFW delete error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("NSFW API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const items = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    for (const item of items) {
      const { error } = await supabaseAdmin
        .from("nsfw_portfolio_images")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id);

      if (error) {
        console.error("NSFW reorder error:", error);
        return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("NSFW API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
