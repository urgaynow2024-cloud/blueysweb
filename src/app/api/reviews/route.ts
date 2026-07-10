import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, avatar, text, project, star_rating, image_url } = data;

    if (!name || !text) {
      return NextResponse.json({ error: "Name and text are required" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { error } = await supabaseAdmin.from("reviews").insert([{
      name,
      avatar: avatar || "🎭",
      text,
      project: project || null,
      star_rating: star_rating || 5,
      image_url: image_url || null,
      approved: false,
    }]);

    if (error) {
      console.error("Review insert error:", error);
      return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
