import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { compressImageBuffer, getCompressedExtension, validateUploadSize, validateUploadType, isImageType, isVideoType, ALLOWED_UPLOAD_TYPES } from "@/lib/compression";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "portfolio";

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

    const storagePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-images")
      .upload(storagePath, uploadBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: isImageType(file.type) ? "image/webp" : file.type,
      });

    if (uploadError || !uploadData) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed", details: uploadError?.message || "Unknown storage error" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("portfolio-images").getPublicUrl(storagePath);

    return NextResponse.json({ url: urlData.publicUrl, path: storagePath });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
