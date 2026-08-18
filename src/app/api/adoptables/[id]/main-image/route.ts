import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { compressImageBuffer, getCompressedExtension, isImageType } from "@/lib/compression";

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

    const ext = file.name.split(".").pop() || "bin";
    let uploadBuffer: Buffer = Buffer.from(await file.arrayBuffer());
    let fileExtension = ext;

    if (isImageType(file.type)) {
      try {
        const compressed = await compressImageBuffer(uploadBuffer, file.type);
        uploadBuffer = compressed as Buffer;
        fileExtension = getCompressedExtension(file.type);
      } catch (compressionError) {
        console.error("Image compression failed, using original:", compressionError);
      }
    }

    const storagePath = `adoptables/${id}/main-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("adoptables")
      .upload(storagePath, uploadBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: isImageType(file.type) ? "image/webp" : file.type,
      });

    if (uploadError || !uploadData) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed", details: uploadError?.message || "Unknown storage error" }, { status: 500 });
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
  } catch (error: any) {
    console.error("Adoptable main image upload error:", error);
    return NextResponse.json({ error: error?.message || "Invalid request" }, { status: 400 });
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
