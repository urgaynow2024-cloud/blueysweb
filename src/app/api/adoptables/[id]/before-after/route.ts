import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { compressImageBuffer, getCompressedExtension, validateUploadSize, validateUploadType, isImageType } from "@/lib/compression";

function parseMissingColumn(errorMessage: string): string | null {
  const match = errorMessage.match(/'(\w+)'? column|Could not find the '(\w+)' column/);
  return match ? (match[1] || match[2]) : null;
}

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

      let insertPayload: Record<string, any> = { adoptable_id: id, [field]: url, [pathField]: path, label: "" };
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: dbData, error: dbError } = await supabaseAdmin
          .from("adoptable_before_after")
          .insert([insertPayload])
          .select();

        if (!dbError && dbData && dbData.length > 0) {
          return NextResponse.json({ id: dbData[0].id, url, path, type }, { status: 201 });
        }

        const col = parseMissingColumn(dbError?.message || "");
        if (col && insertPayload[col] !== undefined) {
          delete insertPayload[col];
          continue;
        }

        console.error("DB insert error:", dbError);
        return NextResponse.json({ error: "Database error", details: dbError?.message || "Unknown database error" }, { status: 500 });
      }

      return NextResponse.json({ error: "Max retries exceeded" }, { status: 500 });
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
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed", details: uploadError?.message || "Unknown storage error" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("portfolio-images").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    const field = type === "before" ? "before_url" : "after_url";
    const pathField = type === "before" ? "before_path" : "after_path";

    let insertPayload: Record<string, any> = { adoptable_id: id, [field]: url, [pathField]: storagePath, label: "" };
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: dbData, error: dbError } = await supabaseAdmin
        .from("adoptable_before_after")
        .insert([insertPayload])
        .select();

      if (!dbError && dbData && dbData.length > 0) {
        return NextResponse.json({ id: dbData[0].id, url, path: storagePath, type }, { status: 201 });
      }

      const col = parseMissingColumn(dbError?.message || "");
      if (col && insertPayload[col] !== undefined) {
        delete insertPayload[col];
        continue;
      }

      console.error("DB insert error:", dbError);
      await supabaseAdmin.storage.from("portfolio-images").remove([storagePath]);
      return NextResponse.json({ error: "Database error", details: dbError?.message || "Unknown database error" }, { status: 500 });
    }

    return NextResponse.json({ error: "Max retries exceeded" }, { status: 500 });
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
