import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  try {
    const auth = authorize(request);
    if (!auth.ok) return auth.response!;

    const { id, path } = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    if (id) {
       const { data: record, error: fetchError } = await supabaseAdmin.from("nsfw_portfolio_images").select("path").eq("id", id).single();
       if (fetchError || !record) {
         return NextResponse.json({ error: "NSFW image not found" }, { status: 404 });
       }
       if (record.path) {
         await supabaseAdmin.storage.from("portfolio-images").remove([record.path]);
       }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("NSFW API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authorize(request);
    if (!auth.ok) return auth.response!;

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
