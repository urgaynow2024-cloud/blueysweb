import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";

export async function DELETE(request: Request) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;
  try {
    const { id, path } = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    if (id) {
       const { data: record, error: fetchError } = await supabaseAdmin.from("portfolio_images").select("path").eq("id", id).single();
       if (fetchError || !record) {
         return NextResponse.json({ error: "Portfolio image not found" }, { status: 404 });
       }
       if (record.path) {
         await supabaseAdmin.storage.from("portfolio-images").remove([record.path]);
       }
    }

    const { error } = await supabaseAdmin.from("portfolio_images").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
