import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const tosFields = ["title", "icon", "section_type", "content", "items", "highlight_box", "box_type", "box_title", "sort_order", "visible"] as const;
const skipFields = new Set<string>();

function buildPayload(body: any, skip: Set<string>) {
  const payload: Record<string, any> = {};
  for (const field of tosFields) {
    if (!skip.has(field) && body[field] !== undefined) {
      payload[field] = body[field];
    }
  }
  return payload;
}

function parseMissingColumn(errorMessage: string): string | null {
  const match = errorMessage.match(/'(\w+)'? column|Could not find the '(\w+)' column/);
  return match ? (match[1] || match[2]) : null;
}

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const { data, error } = await supabaseAdmin
    .from("tos_sections")
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

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    let payload = buildPayload(body, skipFields);

    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await supabaseAdmin.from("tos_sections").insert([payload]).select();

      if (!error) {
        return NextResponse.json(data?.[0], { status: 201 });
      }

      const col = parseMissingColumn(error.message);
      if (col) {
        skipFields.add(col);
        payload = buildPayload(body, skipFields);
        continue;
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Max retries exceeded" }, { status: 500 });
  } catch (error: any) {
    console.error("TOS section create error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
