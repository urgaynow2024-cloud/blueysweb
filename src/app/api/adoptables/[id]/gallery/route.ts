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
      const { url, path } = body;

      if (!url || !path) {
        return NextResponse.json({ error: "url and path are required" }, { status: 400 });
      }

      if (!supabaseAdmin) {
        return NextResponse.json({ error: "Server not configured" }, { status: 500 });
      }

      let insertPayload: Record<string, any> = { adoptable_id: id, url, path };
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: dbData, error: dbError } = await supabaseAdmin
          .from("adoptable_gallery")
          .insert([insertPayload])
          .select();

        if (!dbError && dbData && dbData.length > 0) {
          return NextResponse.json({ id: dbData[0].id, url, path }, { status: 201 });
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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

    const storagePath = `adoptables/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;
    const isNsfw = formData.get("isNsfw") === "true";

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-images")
      .upload(storagePath, uploadBuffer, { cacheControl: "3600", upsert: true, contentType: isImageType(file.type) && file.type !== "image/gif" ? "image/webp" : file.type });

    if (uploadError || !uploadData) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("portfolio-images").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

      let insertPayload: Record<string, any> = { adoptable_id: id, url, path: storagePath, is_nsfw: isNsfw };
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: dbData, error: dbError } = await supabaseAdmin
          .from("adoptable_gallery")
          .insert([insertPayload])
          .select();

        if (!dbError && dbData && dbData.length > 0) {
          return NextResponse.json({ id: dbData[0].id, url, path: storagePath }, { status: 201 });
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

    if (imageId) {
      const { data: galleryRecord, error: fetchError } = await supabaseAdmin.from("adoptable_gallery").select("path").eq("id", imageId).single();
       if (fetchError || !galleryRecord) {
         return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
       }
       if (path && galleryRecord.path) {
         await supabaseAdmin.storage.from("portfolio-images").remove([galleryRecord.path]);
       }
      const { error } = await supabaseAdmin.from("adoptable_gallery").delete().eq("id", imageId);
      if (error) {
        return NextResponse.json({ error: "Failed to delete gallery image" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Adoptable gallery delete error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
