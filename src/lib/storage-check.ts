import { supabaseAdmin } from "./supabase";

export const REQUIRED_BUCKETS = [
  "portfolio-images",
  "adoptables",
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
