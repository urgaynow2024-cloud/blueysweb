import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { display_name, review_text, rating, image_url } = data;

    if (!display_name || !review_text) {
      return NextResponse.json({ error: "Name and review text are required" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { error } = await supabaseAdmin.from("reviews").insert([{
      display_name,
      review_text,
      rating: typeof rating === "number" ? rating : 5,
      status: "pending",
      image_url: image_url || null,
    }]);

    if (error) {
      console.error("Review insert error:", error);
      return NextResponse.json({ error: error.message || "Failed to save review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
