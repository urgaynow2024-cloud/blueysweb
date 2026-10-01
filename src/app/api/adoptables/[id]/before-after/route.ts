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
 * Before/after pairs.
 *
 * GET existed only as an implicit 405 before, which meant the public detail page
 * could never show a comparison even when one was in the database.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // The public site only ever asks for a specific adoptable. Comparisons for a
  // HIDDEN adoptable must not be readable, so the listing is verified first.
  const requested = new URL(request.url).searchParams.get("adoptableId");
  const targetId = UUID_RE.test(requested ?? "") ? requested! : id;

  if (!UUID_RE.test(targetId)) {
    return NextResponse.json({ error: "Invalid adoptable id" }, { status: 400 });
  }

  const { data: owner } = await supabaseAdmin
    .from("adoptables")
    .select("visible, availability")
    .eq("id", targetId)
    .single();

  if (!owner || owner.visible === false || owner.availability === "hidden") {
    return NextResponse.json([]);
  }

  const { data, error } = await supabaseAdmin
    .from("adoptable_before_after")
    .select("*")
    .eq("adoptable_id", targetId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Adoptable before-after read error:", error);
    return NextResponse.json({ error: "Failed to load comparisons" }, { status: 500 });
  }

  // Drop half-finished pairs so the public page never renders an empty slot.
  return NextResponse.json((data ?? []).filter((row) => row.before_url || row.after_url));
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

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    // Aliased so the nested async helper below keeps the non-null narrowing.
    const sb = supabaseAdmin;

    const fieldFor = (type: string) => (type === "before" ? "before_url" : "after_url");
    const pathFieldFor = (type: string) => (type === "before" ? "before_path" : "after_path");
    const otherUrlField = (type: string) => (type === "before" ? "after_url" : "before_url");

    /**
     * Attaches a side to an existing open pair, or starts a new one. Writing one
     * side at a time is what broke before: inserting with the other side NULL
     * violated the original NOT NULL columns and rolled the upload back.
     */
    const attachSide = async (type: string, url: string, path: string) => {
      const urlField = fieldFor(type);
      const pathField = pathFieldFor(type);

      const { data: open } = await sb
        .from("adoptable_before_after")
        .select("id")
        .eq("adoptable_id", id)
        .is(otherUrlField(type), null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (open && open.length > 0) {
        const { data, error } = await sb
          .from("adoptable_before_after")
          .update({ [urlField]: url, [pathField]: path, updated_at: new Date().toISOString() })
          .eq("id", open[0].id)
          .select();
        if (!error && data && data.length > 0) return data[0];
      }

      let payload: Record<string, any> = {
        adoptable_id: id,
        [urlField]: url,
        [pathField]: path,
        label: "",
      };
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error } = await sb
          .from("adoptable_before_after")
          .insert([payload])
          .select();
        if (!error && data && data.length > 0) return data[0];

        const col = parseMissingColumn(error?.message || "");
        if (col && payload[col] !== undefined) {
          delete payload[col];
          continue;
        }
        console.error("DB insert error:", error);
        return null;
      }
      return null;
    };

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { type, url, path } = body;
      if (!type || !url) {
        return NextResponse.json({ error: "type and url are required" }, { status: 400 });
      }
      const row = await attachSide(type === "before" ? "before" : "after", url, path ?? "");
      if (!row) return NextResponse.json({ error: "Database error" }, { status: 500 });
      return NextResponse.json({ id: row.id, url, path: path ?? "", type }, { status: 201 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json({ error: "File and type required" }, { status: 400 });
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
    const side = type === "before" ? "before" : "after";
    const storagePath = `adoptables/${id}/${side}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-images")
      .upload(storagePath, uploadBuffer, { cacheControl: "3600", upsert: true, contentType: file.type || "application/octet-stream" });

    if (uploadError || !uploadData) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("portfolio-images").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    const row = await attachSide(side, url, storagePath);
    if (!row) {
      await supabaseAdmin.storage.from("portfolio-images").remove([storagePath]);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ id: row.id, url, path: storagePath, type: side }, { status: 201 });
  } catch (error) {
    console.error("Adoptable before-after upload error:", error);
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
    const baId = searchParams.get("id");

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    if (baId) {
      const { data: record, error: fetchError } = await supabaseAdmin
        .from("adoptable_before_after")
        .select("before_path, after_path")
        .eq("id", baId)
        .eq("adoptable_id", id)
        .single();
      if (fetchError || !record) {
        return NextResponse.json({ error: "Before-after record not found" }, { status: 404 });
      }
      const paths = [record.before_path, record.after_path].filter(Boolean) as string[];
      if (paths.length > 0) {
        await supabaseAdmin.storage.from("portfolio-images").remove(paths);
      }

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
