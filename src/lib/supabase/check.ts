import { supabaseAdmin } from "./client";
import { ensureBuckets } from "./buckets";

export const REQUIRED_BUCKETS = [
  "portfolio-images",
] as const;

export type BucketStatus = {
  name: string;
  exists: boolean;
  public?: boolean;
  error?: string;
};

export async function checkStorageBuckets(): Promise<BucketStatus[]> {
  if (supabaseAdmin) {
    return checkStorageBucketsAdmin();
  }

  try {
    const res = await fetch("/api/storage/status");
    if (!res.ok) {
      return REQUIRED_BUCKETS.map((name) => ({
        name,
        exists: false,
        error: `Storage status check failed (HTTP ${res.status})`,
      }));
    }
    const data = (await res.json()) as BucketStatus[];
    return data;
  } catch (err: any) {
    return REQUIRED_BUCKETS.map((name) => ({
      name,
      exists: false,
      error: err?.message || "Failed to check storage buckets",
    }));
  }
}

async function checkStorageBucketsAdmin(): Promise<BucketStatus[]> {
  const results: BucketStatus[] = [];

  for (const bucketName of REQUIRED_BUCKETS) {
    try {
      const { data, error } = await supabaseAdmin!.storage.getBucket(bucketName);

      if (error) {
        results.push({
          name: bucketName,
          exists: false,
          error: error.message || `Bucket "${bucketName}" not found`,
        });
      } else if (data) {
        results.push({ name: bucketName, exists: true, public: data.public });
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
  const privateBuckets = bucketStatuses.filter((b) => b.exists && b.public === false);

  const parts: string[] = [];
  if (missing.length > 0) {
    parts.push(
      `Missing: ${missing.map((b) => `"${b.name}"`).join(", ")}\n${missing
        .map((b) => `- ${b.name}: ${b.error}`)
        .join("\n")}`
    );
  }
  if (privateBuckets.length > 0) {
    parts.push(
      `Not publicly readable: ${privateBuckets.map((b) => `"${b.name}"`).join(", ")} — images stored here will not load on the public site.`
    );
  }
  if (parts.length === 0) return null;

  return `${parts.join("\n\n")}\n\nFix in Supabase Dashboard → Storage: set each bucket to Public for read access.`;
}

export async function testBucketUpload(bucket: string): Promise<{ success: boolean; error?: string }> {
  if (supabaseAdmin) {
    return testBucketUploadAdmin(bucket);
  }

  try {
    const res = await fetch("/api/storage/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test-upload", bucket }),
    });
    if (!res.ok) {
      return { success: false, error: `Upload test failed (HTTP ${res.status})` };
    }
    const data = (await res.json()) as { success: boolean; error?: string };
    return data;
  } catch (err: any) {
    return { success: false, error: err?.message || "Upload test failed" };
  }
}

function testBucketUploadAdmin(bucket: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    (async () => {
      try {
        // Ensure bucket exists and is public before testing
        const bucketResults = await ensureBuckets([bucket]);
        const bucketResult = bucketResults[0];
        if (!bucketResult.ok) {
          resolve({ success: false, error: `Bucket not available: ${bucketResult.error}` });
          return;
        }

        const testPath = `_cors-test-${Date.now()}.txt`;
        const testContent = new Blob(["test"], { type: "text/plain" });

        const { error } = await supabaseAdmin!.storage
          .from(bucket)
          .upload(testPath, testContent, {
            cacheControl: "3600",
            upsert: true,
            contentType: "text/plain",
          });

        if (error) {
          resolve({ success: false, error: error.message || "Upload test failed" });
          return;
        }

        await supabaseAdmin!.storage.from(bucket).remove([testPath]);
        resolve({ success: true });
      } catch (err: any) {
        resolve({ success: false, error: err?.message || "Upload test failed" });
      }
    })();
  });
}
