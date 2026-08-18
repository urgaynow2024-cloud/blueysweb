import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize } from "@/lib/auth";
import { compressImageBuffer, getCompressedExtension, validateUploadSize, validateUploadType, isImageType } from "@/lib/compression";

export async function POST(request: NextRequest) {
  try {
    const auth = authorize(request);
    if (!auth.ok) return auth.response!;

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

    const storagePath = `nsfw/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-images")
      .upload(storagePath, uploadBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: isImageType(file.type) ? "image/webp" : file.type,
      });

    if (uploadError || !uploadData) {
      console.error("NSFW storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed", details: uploadError?.message || "Unknown storage error" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("portfolio-images").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("nsfw_portfolio_images")
      .insert([{ url, path: storagePath }])
      .select();

    if (dbError || !dbData || dbData.length === 0) {
      console.error("NSFW DB insert error:", dbError);
      await supabaseAdmin.storage.from("portfolio-images").remove([storagePath]);
      return NextResponse.json({ error: "Database error", details: dbError?.message || "Unknown database error" }, { status: 500 });
    }

    return NextResponse.json({ id: dbData[0].id, url, path: storagePath });
  } catch (error) {
    console.error("NSFW API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
