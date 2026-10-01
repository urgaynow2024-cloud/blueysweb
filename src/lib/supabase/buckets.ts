import { supabaseAdmin } from "./client";

const REQUIRED_BUCKETS = ["portfolio-images"] as const;

export type BucketResult = {
  ok: boolean;
  created?: string;
  madePublic?: string;
  error?: string;
};

/**
 * Ensures every required storage bucket exists and is publicly readable.
 *
 * The service role bypasses RLS, so uploads succeed regardless of the bucket's
 * policy set — but getPublicUrl() only returns a working URL for a public
 * bucket. A missing or private bucket therefore fails uploads outright, or
 * stores files that render as broken images everywhere on the site.
 */
export async function ensureBuckets(buckets: readonly string[] = REQUIRED_BUCKETS): Promise<BucketResult[]> {
  const results: BucketResult[] = [];
  if (!supabaseAdmin) {
    return buckets.map((name) => ({ ok: false, error: "Supabase admin client not configured" }));
  }

  for (const name of buckets) {
    const result: BucketResult = { ok: false };
    try {
      const { data, error } = await supabaseAdmin.storage.getBucket(name);

      if (error || !data) {
        const { error: createError } = await supabaseAdmin.storage.createBucket(name, {
          public: true,
          fileSizeLimit: 52428800,
        });
        if (createError) {
          result.error = createError.message || `Bucket "${name}" could not be created`;
          results.push(result);
          continue;
        }
        result.ok = true;
        result.created = name;
        results.push(result);
        continue;
      }

      if (!data.public) {
        const { error: updateError } = await supabaseAdmin.storage.updateBucket(name, { public: true });
        if (updateError) {
          result.error = updateError.message || `Bucket "${name}" could not be made public`;
          results.push(result);
          continue;
        }
        result.madePublic = name;
      }

      result.ok = true;
    } catch (err: any) {
      result.error = err?.message || `Bucket "${name}" check failed`;
    }
    results.push(result);
  }

  return results;
}