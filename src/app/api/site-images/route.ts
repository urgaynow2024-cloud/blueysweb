import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const key = formData.get("key") as string | null;

    if (!file || !key) {
      return NextResponse.json({ error: "File and key are required" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const ext = file.name.split(".").pop() || "bin";
    const storagePath = `site/${key}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-images")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError || !uploadData) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("portfolio-images").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    const { error: dbError } = await supabaseAdmin
      .from("site_images")
      .upsert({ key, url, path: storagePath, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, url, path: storagePath });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
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
