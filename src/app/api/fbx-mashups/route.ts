import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const { data, error } = await supabaseAdmin
    .from("fbx_mashups")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, avatar_base, software_used, price, featured, visible, sort_order } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("fbx_mashups")
      .insert([{ title, description, avatar_base, software_used, price, featured, visible, sort_order }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0], { status: 201 });
  } catch (error) {
    console.error("FBX mashup create error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}