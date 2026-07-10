import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, avatar, text, project } = data;

    if (!name || !text) {
      return NextResponse.json({ error: "Name and text are required" }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("reviews").insert([{ name, avatar: avatar || "🎭", text, project: project || null }]);
      if (error) {
        console.error("Review insert error:", error);
        return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
