import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const REQUIRED_BUCKETS = ["portfolio-images"] as const;

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      REQUIRED_BUCKETS.map((name) => ({
        name,
        exists: false,
        error: "Supabase admin client not configured",
      }))
    );
  }

  const results: { name: string; exists: boolean; error?: string }[] = [];

  for (const bucketName of REQUIRED_BUCKETS) {
    try {
      const { data, error } = await supabaseAdmin.storage.getBucket(bucketName);

      if (error) {
        results.push({
          name: bucketName,
          exists: false,
          error: "Bucket not found",
        });
      } else if (data) {
        results.push({ name: bucketName, exists: true });
      } else {
        results.push({
          name: bucketName,
          exists: false,
          error: `Bucket "${bucketName}" not found`,
        });
      }
    } catch (err: any) {
      results.push({
        name: bucketName,
        exists: false,
        error: "Bucket check failed",
      });
    }
  }

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: "Supabase admin not configured" });
  }

  try {
    const body = await request.json();
    const { action, bucket } = body as { action?: string; bucket?: string };

    if (action === "test-upload" && bucket) {
      const testPath = `_cors-test-${Date.now()}.txt`;
      const testContent = new Blob(["test"], { type: "text/plain" });

      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(testPath, testContent, {
          cacheControl: "3600",
          upsert: true,
          contentType: "text/plain",
        });

      if (error) {
        return NextResponse.json({ success: false, error: "Upload test failed" });
      }

      await supabaseAdmin.storage.from(bucket).remove([testPath]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Upload test failed" });
  }
}
