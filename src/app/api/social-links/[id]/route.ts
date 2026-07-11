import { NextResponse } from "next/server";
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
      .from("social_links")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Fetch social link error:", error);
      return NextResponse.json({ error: "Failed to fetch social link" }, { status: 500 });
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
    const { name, url, description, sort_order } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (url !== undefined) updates.url = url;
    if (description !== undefined) updates.description = description || null;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    const { data, error } = await supabaseAdmin
      .from("social_links")
      .update(updates)
      .eq("id", id)
      .select();

    if (error || !data || data.length === 0) {
      console.error("Social link update error:", error);
      return NextResponse.json({ error: "Failed to update social link" }, { status: 500 });
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
      .from("social_links")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Social link delete error:", error);
      return NextResponse.json({ error: "Failed to delete social link" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
