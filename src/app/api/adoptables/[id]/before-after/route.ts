import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json({ error: "File and type required" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const ext = file.name.split(".").pop();
    const storagePath = `adoptables/${id}/${type}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("adoptables")
      .upload(storagePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError || !uploadData) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("adoptables").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    const field = type === "before" ? "before_url" : "after_url";
    const pathField = type === "before" ? "before_path" : "after_path";

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("adoptable_before_after")
      .insert([{ adoptable_id: id, [field]: url, [pathField]: storagePath, label: "" }])
      .select();

    if (dbError || !dbData || dbData.length === 0) {
      await supabaseAdmin.storage.from("adoptables").remove([storagePath]);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ id: dbData[0].id, url, path: storagePath, type }, { status: 201 });
  } catch (error) {
    console.error("Adoptable before-after upload error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const baId = searchParams.get("id");
    const beforePath = searchParams.get("beforePath");
    const afterPath = searchParams.get("afterPath");

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    if (beforePath) await supabaseAdmin.storage.from("adoptables").remove([beforePath]);
    if (afterPath) await supabaseAdmin.storage.from("adoptables").remove([afterPath]);

    if (baId) {
      const { error } = await supabaseAdmin.from("adoptable_before_after").delete().eq("id", baId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Adoptable before-after delete error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
