import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const ext = file.name.split(".").pop() || "bin";
    const storagePath = `nsfw/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-images")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError || !uploadData) {
      console.error("NSFW storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("portfolio-images").getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("nsfw_portfolio_images")
      .insert([{ url }])
      .select();

    if (dbError || !dbData || dbData.length === 0) {
      console.error("NSFW DB insert error:", dbError);
      await supabaseAdmin.storage.from("portfolio-images").remove([storagePath]);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ id: dbData[0].id, url, path: storagePath });
  } catch (error) {
    console.error("NSFW API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
