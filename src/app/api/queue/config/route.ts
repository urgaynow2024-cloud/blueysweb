import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const QUEUE_KEYS = [
  "queue_status",
  "queue_slots_total",
  "queue_slots_used",
  "queue_wait_time",
  "queue_notes",
  "queue_last_updated",
];

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("site_config")
      .select("key, value")
      .in("key", QUEUE_KEYS);

    if (error) {
      console.error("Fetch queue config error:", error);
      return NextResponse.json({ error: "Failed to fetch queue config" }, { status: 500 });
    }

    const result: Record<string, string> = {};
    if (data) {
      data.forEach((row: any) => {
        result[row.key] = row.value;
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const updates: any = {};
    for (const key of QUEUE_KEYS) {
      if (body[key] !== undefined) {
        updates[key] = String(body[key]);
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const rows = Object.entries(updates).map(([key, value]) => ({ key, value }));
    
    for (const row of rows) {
      const { error } = await supabaseAdmin
        .from("site_config")
        .upsert({ key: row.key, value: row.value, updated_at: new Date().toISOString() }, { onConflict: "key" });

      if (error) {
        console.error("Queue config update error:", error);
        return NextResponse.json({ error: "Failed to update queue config" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
