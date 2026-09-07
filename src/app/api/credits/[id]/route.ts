import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function getIdFromUrl(url: string) {
  const parts = url.split("/");
  return parts[parts.length - 1];
}

export async function GET(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const id = getIdFromUrl(request.url);
    const { data, error } = await supabaseAdmin
      .from("credits")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Fetch credit error:", error);
      return NextResponse.json({ error: "Failed to fetch credit" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const id = getIdFromUrl(request.url);
    const body = await request.json();

    const updates: Record<string, any> = {};
    for (const key of ["name", "description", "categories", "avatar_url", "avatar_path", "website_url", "discord_url", "social_links", "note", "featured", "visible", "sort_order"]) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const { data, error } = await supabaseAdmin
      .from("credits")
      .update(updates)
      .eq("id", id)
      .select();

    if (error || !data || data.length === 0) {
      console.error("Credit update error:", error);
      return NextResponse.json({ error: "Failed to update credit" }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const id = getIdFromUrl(request.url);
    const { error } = await supabaseAdmin
      .from("credits")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Credit delete error:", error);
      return NextResponse.json({ error: "Failed to delete credit" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
