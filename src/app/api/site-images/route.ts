import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize } from "@/lib/auth";

function sanitiseFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 80);
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin.from("site_images").select("*");

    if (error) {
      console.error("Fetch site images error:", error);
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }

    const result: Record<string, any> = {};
    if (data) {
      data.forEach((item: any) => {
        result[item.key] = { url: item.url, path: item.path };
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authorize(request);
    if (!auth.ok) return auth.response!;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { key, url, path } = body;

      if (!key || !url || !path) {
        return NextResponse.json({ error: "key, url, and path are required" }, { status: 400 });
      }

      const { error: dbError } = await supabaseAdmin
        .from("site_images")
        .upsert({ key, url, path, updated_at: new Date().toISOString() }, { onConflict: "key" });

      if (dbError) {
        console.error("DB error:", dbError);
        return NextResponse.json({ error: "Database error", details: dbError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, url, path });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const key = (formData.get("key") as string | null)?.trim();

    if (!file || !key) {
      return NextResponse.json({ error: "File and key are required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be under 10MB" }, { status: 400 });
    }

    const originalName = file.name || "upload";
    const ext = originalName.split(".").pop() || "bin";
    const safeKey = sanitiseFileName(key);
    const storagePath = `site-images/${safeKey}.${ext}`;

    const uploadOptions: any = {
      cacheControl: "3600",
      upsert: true,
    };

    if (file.type) {
      uploadOptions.contentType = file.type;
    }

    const bucketCheck = await supabaseAdmin.storage.getBucket("portfolio-images");
    if (bucketCheck.error) {
      console.error("Bucket check error:", bucketCheck.error);
      return NextResponse.json(
        {
          error: "Storage bucket 'portfolio-images' not found. Create it in Supabase Dashboard → Storage → New bucket.",
          details: bucketCheck.error.message,
        },
        { status: 500 }
      );
    }

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-images")
      .upload(storagePath, file, uploadOptions);

    if (uploadError || !uploadData) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        {
          error: "Upload failed",
          details: uploadError?.message || "Unknown storage error",
        },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage.from("portfolio-images").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    const { error: dbError } = await supabaseAdmin
      .from("site_images")
      .upsert({ key, url, path: storagePath, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json({ error: "Database error", details: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, url, path: storagePath });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = authorize(request);
    if (!auth.ok) return auth.response!;

    const { key, path } = await request.json();

    if (!key || !supabaseAdmin) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    if (path) {
      await supabaseAdmin.storage.from("portfolio-images").remove([path]);
    }

    const { error } = await supabaseAdmin.from("site_images").delete().eq("key", key);
    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
