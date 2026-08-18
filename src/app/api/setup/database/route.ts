import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(__dirname, "../../../../../supabase/schema.sql");
const SETUP_FLAG_KEY = "db_setup_completed";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ needsSetup: true, reason: "not_configured" });
    }

    const { data, error } = await supabaseAdmin
      .from("site_config")
      .select("value")
      .eq("key", SETUP_FLAG_KEY)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ needsSetup: true, reason: "query_failed" });
    }

    if (data?.value === "true") {
      return NextResponse.json({ needsSetup: false });
    }

    return NextResponse.json({ needsSetup: true, reason: "not_setup" });
  } catch {
    return NextResponse.json({ needsSetup: true, reason: "error" });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { data: existing } = await supabaseAdmin
      .from("site_config")
      .select("value")
      .eq("key", SETUP_FLAG_KEY)
      .maybeSingle();

    if (existing?.value === "true") {
      return NextResponse.json({ success: true, message: "Database already set up" });
    }

    const schemaSql = readFileSync(SCHEMA_PATH, "utf-8");

    const managementToken = process.env.SUPABASE_ACCESS_TOKEN;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

    let result: { success: boolean; message: string; rowsAffected?: number };

    if (managementToken && supabaseUrl) {
      try {
        const projectRef = supabaseUrl.replace(/^https?:\/\//, "").split(".")[0];
        const mgmtUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

        const mgmtResponse = await fetch(mgmtUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${managementToken}`,
          },
          body: JSON.stringify({ query: schemaSql }),
        });

        if (mgmtResponse.ok) {
          const data = await mgmtResponse.json();
          result = { success: true, message: "Schema executed via Management API", rowsAffected: Array.isArray(data) ? data.length : 0 };
        } else {
          const errText = await mgmtResponse.text();
          result = { success: false, message: `Management API ${mgmtResponse.status}: ${errText.slice(0, 200)}` };
        }
      } catch (mgmtError: any) {
        result = { success: false, message: `Management API error: ${mgmtError?.message || String(mgmtError)}` };
      }
    } else {
      result = { success: false, message: "SUPABASE_ACCESS_TOKEN not configured. Run schema.sql manually in Supabase SQL Editor." };
    }

    if (result.success) {
      await supabaseAdmin.from("site_config").upsert({ key: SETUP_FLAG_KEY, value: "true" }, { onConflict: "key" });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Database setup error:", error);
    return NextResponse.json({ error: error?.message || "Setup failed" }, { status: 500 });
  }
}
