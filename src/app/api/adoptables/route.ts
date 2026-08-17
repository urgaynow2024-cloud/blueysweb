import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const adoptableFields = ["title", "description", "category", "price", "availability", "featured", "visible", "sort_order"] as const;
const skipFields = new Set<string>();

function buildPayload(body: any, skip: Set<string>) {
  const payload: Record<string, any> = {};
  for (const field of adoptableFields) {
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
    .from("adoptables")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function DELETE() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  await supabaseAdmin.from("adoptable_before_after").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabaseAdmin.from("adoptable_gallery").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await supabaseAdmin.from("adoptables").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    let payload = buildPayload(body, skipFields);

    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await supabaseAdmin.from("adoptables").insert([payload]).select();

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
    console.error("Adoptable create error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
