import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("credits")
      .select("*")
      .eq("visible", true)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch credits error:", error);
      return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { name, description, categories, avatar_url, avatar_path, website_url, discord_url, social_links, note, featured, visible, sort_order } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("credits")
      .insert([{
        name,
        description: description || null,
        categories: categories || [],
        avatar_url: avatar_url || null,
        avatar_path: avatar_path || null,
        website_url: website_url || null,
        discord_url: discord_url || null,
        social_links: social_links || {},
        note: note || null,
        featured: featured || false,
        visible: visible ?? true,
        sort_order: sort_order ?? 0,
      }])
      .select();

    if (error || !data || data.length === 0) {
      console.error("Credit insert error:", error);
      return NextResponse.json({ error: "Failed to create credit" }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
