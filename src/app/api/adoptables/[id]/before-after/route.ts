import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { compressImageBuffer, getCompressedExtension, validateUploadSize, validateUploadType, isImageType } from "@/lib/compression/server";

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
        return NextResponse.json({ error: "Database error" }, { status: 500 });
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
      return NextResponse.json({ error: typeValidation.error!.message, category: typeValidation.error!.category }, { status: 400 });
    }

    const sizeValidation = validateUploadSize(file.size, file.type);
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error!.message, category: sizeValidation.error!.category }, { status: 400 });
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
      .upload(storagePath, uploadBuffer, { cacheControl: "3600", upsert: true, contentType: isImageType(file.type) && file.type !== "image/gif" ? "image/webp" : file.type });

    if (uploadError || !uploadData) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
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
        return NextResponse.json({ error: "Database error" }, { status: 500 });
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

    if (baId) {
      const { data: record, error: fetchError } = await supabaseAdmin.from("adoptable_before_after").select("before_path, after_path").eq("id", baId).single();
      if (fetchError || !record) {
        return NextResponse.json({ error: "Before-after record not found" }, { status: 404 });
      }
      if (record.before_path) await supabaseAdmin.storage.from("portfolio-images").remove([record.before_path]);
      if (record.after_path) await supabaseAdmin.storage.from("portfolio-images").remove([record.after_path]);

      const { error } = await supabaseAdmin.from("adoptable_before_after").delete().eq("id", baId);
      if (error) {
        return NextResponse.json({ error: "Failed to delete comparison" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Adoptable before-after delete error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
