import { NextResponse } from "next/server";

const { Pool } = require("pg");

export async function POST() {
  const ref = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "").replace(/\.supabase\.co$/, "") || "";
  const password = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const configs = [
    `postgresql://postgres:${password}@${ref}.supabase.co:5432/postgres`,
    `postgresql://${ref}:${password}@${ref}.pooler.supabase.com:6543/postgres`,
  ];

  let pool: any = null;
  let lastError: string = "";

  for (const cs of configs) {
    try {
      pool = new Pool({ connectionString: cs, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
      const client = await pool.connect();

      const columns = [
        "ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS avatar_base TEXT",
        "ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS software_used TEXT[] DEFAULT '{}'::TEXT[]",
        "ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS price TEXT",
        "ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE",
        "ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE",
        "ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0",
      ];

      const result: string[] = [];
      for (const col of columns) {
        try {
          await client.query(col);
          result.push(col);
        } catch (e: any) {
          result.push(`${col} -> ${e.message}`);
        }
      }

      await client.query("NOTIFY pgrst, 'reload schema'");
      client.release();
      await pool.end();
      return NextResponse.json({ success: true, applied: result });
    } catch (e: any) {
      lastError = e.message || "unknown error";
      try { await pool?.end(); } catch {}
      pool = null;
    }
  }

  return NextResponse.json({ error: `Could not connect: ${lastError}` }, { status: 500 });
}
