import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";
import { validateUploadSize, validateUploadType } from "@/lib/compression/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseMissingColumn(errorMessage: string): string | null {
  const match = errorMessage.match(/'(\w+)'? column|Could not find the '(\w+)' column/);
  return match ? match[1] || match[2] : null;
}

/**
 * Lists an adoptable's gallery images.
 *
 * The admin editor's `reload()` fetches this per adoptable to populate the media
 * panel, and previously this route exported no GET at all. Next answered every
 * read with 405, the client treated that as "no images", and the panel reported
 * an adoptable with no gallery even though rows existed in the database — the
 * admin's gallery and card artwork silently disappeared.
 *
 * This route reads through the service-role client, so it bypasses RLS and is
 * therefore admin-only. The public site keeps using the anon client in
 * `lib/db.ts`, whose RLS policies still scope it to listed adoptables.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response!;

  try {
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Invalid adoptable id" }, { status: 400 });
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("adoptable_gallery")
      .select("*")
      .eq("adoptable_id", id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Adoptable gallery read error:", error);
      return NextResponse.json({ error: "Failed to load gallery" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Adoptable gallery read error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/** Reorders gallery thumbnails. The first image is used when no main image is set. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response!;

  try {
    const { id } = await params;
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: "No gallery images supplied" }, { status: 400 });
    }

    const updated: string[] = [];
    const failed: { id: string; error: string }[] = [];

    for (const item of items) {
      if (!item || typeof item.id !== "string" || !UUID_RE.test(item.id)) continue;
      const sortOrder = Number(item.sort_order);
      const { error } = await supabaseAdmin
        .from("adoptable_gallery")
        .update({ sort_order: Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0, updated_at: new Date().toISOString() })
        .eq("id", item.id)
        .eq("adoptable_id", id);
      if (error) failed.push({ id: item.id, error: error.message });
      else updated.push(item.id);
    }

    if (failed.length > 0) {
      return NextResponse.json(
        { error: `Failed to reorder ${failed.length} image(s)`, updated, failed },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Adoptable gallery reorder error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/** Updates per-image metadata, currently the NSFW flag used by the age gate. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response!;

  try {
    const { id } = await params;
    const body = await request.json();
    const imageId = body?.imageId;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }
    if (typeof imageId !== "string" || !UUID_RE.test(imageId)) {
      return NextResponse.json({ error: "imageId is required" }, { status: 400 });
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.isNsfw === "boolean") patch.is_nsfw = body.isNsfw;
    if (typeof body.label === "string") patch.label = body.label;

    const { data, error } = await supabaseAdmin
      .from("adoptable_gallery")
      .update(patch)
      .eq("id", imageId)
      .eq("adoptable_id", id)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, image: data[0] });
  } catch (error) {
    console.error("Adoptable gallery update error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response!;

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

    const uploadBuffer: Buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop() || "bin";

    const storagePath = `adoptables/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;
    const isNsfw = formData.get("isNsfw") === "true";

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-images")
      .upload(storagePath, uploadBuffer, { cacheControl: "3600", upsert: true, contentType: file.type || "application/octet-stream" });

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
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response!;

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    if (imageId) {
      const { data: galleryRecord, error: fetchError } = await supabaseAdmin
        .from("adoptable_gallery")
        .select("path, storage_path")
        .eq("id", imageId)
        .eq("adoptable_id", id)
        .single();
      if (fetchError || !galleryRecord) {
        return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
      }

      // Storage cleanup happens here on the service-role client. Deleting from
      // the browser with the anon key fails the storage policy and orphans the
      // object while still removing the row.
      const path = galleryRecord.path ?? galleryRecord.storage_path;
      if (path) {
        const { error: storageError } = await supabaseAdmin.storage
          .from("portfolio-images")
          .remove([path]);
        if (storageError) {
          console.error("Failed to remove gallery object from storage:", storageError);
        }
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
