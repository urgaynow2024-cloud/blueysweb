import { supabaseAdmin } from "./supabase";

export const REQUIRED_BUCKETS = [
  "portfolio-images",
] as const;

export type BucketStatus = {
  name: string;
  exists: boolean;
  error?: string;
};

export async function checkStorageBuckets(): Promise<BucketStatus[]> {
  if (!supabaseAdmin) {
    return REQUIRED_BUCKETS.map((name) => ({
      name,
      exists: false,
      error: "Supabase admin client not configured",
    }));
  }

  const results: BucketStatus[] = [];

  for (const bucketName of REQUIRED_BUCKETS) {
    try {
      const { data, error } = await supabaseAdmin.storage.getBucket(bucketName);

      if (error) {
        results.push({
          name: bucketName,
          exists: false,
          error: error.message || `Bucket "${bucketName}" not found`,
        });
      } else if (data) {
        results.push({
          name: bucketName,
          exists: true,
        });
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
        error: err?.message || `Failed to check bucket "${bucketName}"`,
      });
    }
  }

  return results;
}

export function getMissingBucketMessage(bucketStatuses: BucketStatus[]): string | null {
  const missing = bucketStatuses.filter((b) => !b.exists);
  if (missing.length === 0) return null;

  const bucketList = missing.map((b) => `"${b.name}"`).join(" and ");
  const details = missing
    .map((b) => `- ${b.name}: ${b.error}`)
    .join("\n");

  return `Missing Supabase Storage bucket(s): ${bucketList}\n\n${details}\n\nCreate them in Supabase Dashboard → Storage → New bucket. Set them to Public for read access.`;
}

export async function testBucketUpload(bucket: string): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: "Supabase admin not configured" };
  }

  try {
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
      return { success: false, error: error.message || "Upload test failed" };
    }

    await supabaseAdmin.storage.from(bucket).remove([testPath]);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Upload test failed" };
  }
}
