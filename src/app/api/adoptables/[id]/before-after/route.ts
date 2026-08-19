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
      const { type, url, path } = body;

      if (!type || !url || !path) {
        return NextResponse.json({ error: "type, url, and path are required" }, { status: 400 });
      }

      if (!supabaseAdmin) {
        return NextResponse.json({ error: "Server not configured" }, { status: 500 });
      }

      const field = type === "before" ? "before_url" : "after_url";
      const pathField = type === "before" ? "before_path" : "after_path";

      const { data: dbData, error: dbError } = await supabaseAdmin
        .from("adoptable_before_after")
        .insert([{ adoptable_id: id, [field]: url, [pathField]: path, label: "" }])
        .select();

      if (dbError || !dbData || dbData.length === 0) {
        return NextResponse.json({ error: "Database error", details: dbError?.message }, { status: 500 });
      }

      return NextResponse.json({ id: dbData[0].id, url, path, type }, { status: 201 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json({ error: "File and type required" }, { status: 400 });
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

    const storagePath = `adoptables/${id}/${type}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-images")
      .upload(storagePath, uploadBuffer, { cacheControl: "3600", upsert: true, contentType: isImageType(file.type) ? "image/webp" : file.type });

    if (uploadError || !uploadData) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("portfolio-images").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    const field = type === "before" ? "before_url" : "after_url";
    const pathField = type === "before" ? "before_path" : "after_path";

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("adoptable_before_after")
      .insert([{ adoptable_id: id, [field]: url, [pathField]: storagePath, label: "" }])
      .select();

    if (dbError || !dbData || dbData.length === 0) {
      await supabaseAdmin.storage.from("portfolio-images").remove([storagePath]);
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

    if (beforePath) await supabaseAdmin.storage.from("portfolio-images").remove([beforePath]);
    if (afterPath) await supabaseAdmin.storage.from("portfolio-images").remove([afterPath]);

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
