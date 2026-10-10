import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth/guard";
import { ensureBuckets } from "@/lib/supabase/buckets";

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
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response!;
  if (guard.session?.role !== "owner") {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: "Supabase admin not configured" });
  }

  try {
    const body = await request.json();
    const { action, bucket } = body as { action?: string; bucket?: string };

    if (action === "test-upload" && bucket) {
      // SECURITY: the bucket name used to be taken straight from the request
      // and passed to the service-role client, which let any authenticated
      // caller write and delete objects in ANY bucket in the project. Bucket
      // names are now validated against the known allow-list.
      if (!(REQUIRED_BUCKETS as readonly string[]).includes(bucket)) {
        return NextResponse.json(
          { success: false, error: "Unknown bucket" },
          { status: 400 },
        );
      }

      // Ensure bucket exists and is public before testing
      const bucketResults = await ensureBuckets([bucket]);
      const bucketResult = bucketResults[0];
      if (!bucketResult.ok) {
        return NextResponse.json({ success: false, error: `Bucket not available: ${bucketResult.error}` });
      }

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
        return NextResponse.json({ success: false, error: error.message || "Upload test failed" });
      }

      await supabaseAdmin.storage.from(bucket).remove([testPath]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Upload test failed" });
  }
}
