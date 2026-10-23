import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth/guard";
import { validateUploadSize, validateUploadType } from "@/lib/compression/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("adoptables");
  if (!auth.ok) return auth.response!;

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

    // Same validation the shared upload endpoint applies, so a rejected file
    // never reaches storage and never produces a broken stored URL.
    const typeValidation = validateUploadType(file.type);
    if (!typeValidation.valid) {
      return NextResponse.json(
        { error: typeValidation.error!.message, category: typeValidation.error!.category },
        { status: 400 },
      );
    }
    const sizeValidation = validateUploadSize(file.size, file.type);
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { error: sizeValidation.error!.message, category: sizeValidation.error!.category },
        { status: 400 },
      );
    }

    const fileExtension = file.name.split(".").pop() || "bin";
    const uploadBuffer: Buffer = Buffer.from(await file.arrayBuffer());

    const storagePath = `adoptables/${id}/main-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-images")
      .upload(storagePath, uploadBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError || !uploadData) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("portfolio-images").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    // Replace: the previously stored main image object is removed so replacing
    // the artwork does not accumulate orphans in the bucket.
    const { data: previous, error: readError } = await supabaseAdmin
      .from("adoptables")
      .select("main_image_path")
      .eq("id", id)
      .single();
    if (readError) {
      await supabaseAdmin.storage.from("portfolio-images").remove([storagePath]);
      return NextResponse.json({ error: "Adoptable not found" }, { status: 404 });
    }

    const { error: dbError } = await supabaseAdmin
      .from("adoptables")
      .update({ main_image: url, main_image_path: storagePath })
      .eq("id", id);

    if (dbError) {
      console.error("DB update error:", dbError);
      await supabaseAdmin.storage.from("portfolio-images").remove([storagePath]);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const oldPath = previous?.main_image_path;
    if (oldPath && oldPath !== storagePath) {
      await supabaseAdmin.storage.from("portfolio-images").remove([oldPath]);
    }

    return NextResponse.json({ id, url, path: storagePath }, { status: 201 });
  } catch (error: any) {
    console.error("Adoptable main image upload error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("adoptables");
  if (!auth.ok) return auth.response!;

  try {
    const { id } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { data: adoptable, error: fetchError } = await supabaseAdmin
      .from("adoptables")
      .select("main_image_path")
      .eq("id", id)
      .single();
    if (fetchError || !adoptable) {
      return NextResponse.json({ error: "Adoptable not found" }, { status: 404 });
    }
    if (adoptable.main_image_path) {
      await supabaseAdmin.storage.from("portfolio-images").remove([adoptable.main_image_path]);
    }

    const { error } = await supabaseAdmin
      .from("adoptables")
      .update({ main_image: null, main_image_path: null })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to remove main image" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Adoptable main image delete error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
