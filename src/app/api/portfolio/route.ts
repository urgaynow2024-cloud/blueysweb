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
      const { error } = await supabaseAdmin.from("portfolio_images").delete().eq("id", id);
      if (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
