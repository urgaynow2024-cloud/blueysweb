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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const ext = file.name.split(".").pop();
    const storagePath = `adoptables/${id}/main-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("adoptables")
      .upload(storagePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError || !uploadData) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("adoptables").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    const { error: dbError } = await supabaseAdmin
      .from("adoptables")
      .update({ main_image: url, main_image_path: storagePath })
      .eq("id", id);

    if (dbError) {
      await supabaseAdmin.storage.from("adoptables").remove([storagePath]);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ id, url, path: storagePath }, { status: 201 });
  } catch (error) {
    console.error("Adoptable main image upload error:", error);
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
    const path = searchParams.get("path");

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    if (path) {
      await supabaseAdmin.storage.from("adoptables").remove([path]);
    }

    const { error } = await supabaseAdmin
      .from("adoptables")
      .update({ main_image: null, main_image_path: null })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Adoptable main image delete error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
