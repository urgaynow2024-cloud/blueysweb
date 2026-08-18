import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { compressImageBuffer, getCompressedExtension, validateUploadSize, validateUploadType, isImageType } from "@/lib/compression";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { url, path } = body;

      if (!url || !path) {
        return NextResponse.json({ error: "url and path are required" }, { status: 400 });
      }

      if (!supabaseAdmin) {
        return NextResponse.json({ error: "Server not configured" }, { status: 500 });
      }

      const { data: dbData, error: dbError } = await supabaseAdmin
        .from("adoptable_gallery")
        .insert([{ adoptable_id: id, url, path, is_nsfw: false }])
        .select();

      if (dbError || !dbData || dbData.length === 0) {
        return NextResponse.json({ error: "Database error", details: dbError?.message }, { status: 500 });
      }

      return NextResponse.json({ id: dbData[0].id, url, path }, { status: 201 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const typeValidation = validateUploadType(file.type);
    if (!typeValidation.valid) {
      return NextResponse.json({ error: typeValidation.error }, { status: 400 });
    }

    const sizeValidation = validateUploadSize(file.size, file.type);
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
    }

    let uploadBuffer: Buffer = Buffer.from(await file.arrayBuffer());
    let fileExtension = file.name.split(".").pop() || "bin";

    if (isImageType(file.type)) {
      const compressed = await compressImageBuffer(uploadBuffer, file.type);
      uploadBuffer = compressed;
      fileExtension = getCompressedExtension(file.type);
    }

    const storagePath = `adoptables/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;
    const isNsfw = formData.get("isNsfw") === "true";

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("adoptables")
      .upload(storagePath, uploadBuffer, { cacheControl: "3600", upsert: true, contentType: isImageType(file.type) ? "image/webp" : file.type });

    if (uploadError || !uploadData) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("adoptables").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("adoptable_gallery")
      .insert([{ adoptable_id: id, url, path: storagePath, is_nsfw: isNsfw }])
      .select();

    if (dbError || !dbData || dbData.length === 0) {
      await supabaseAdmin.storage.from("adoptables").remove([storagePath]);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ id: dbData[0].id, url, path: storagePath }, { status: 201 });
  } catch (error) {
    console.error("Adoptable gallery upload error:", error);
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
    const imageId = searchParams.get("imageId");
    const path = searchParams.get("path");

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    if (path) {
      await supabaseAdmin.storage.from("adoptables").remove([path]);
    }

    if (imageId) {
      const { error } = await supabaseAdmin.from("adoptable_gallery").delete().eq("id", imageId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Adoptable gallery delete error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
