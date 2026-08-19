"use client";

import { supabase } from "@/lib/supabase";
import { checkStorageBuckets, getMissingBucketMessage, type BucketStatus } from "./storage-check";

let cachedBucketCheck: { timestamp: number; statuses: BucketStatus[] } | null = null;
const BUCKET_CACHE_MS = 30_000;

async function getBucketStatuses() {
  const now = Date.now();
  if (cachedBucketCheck && now - cachedBucketCheck.timestamp < BUCKET_CACHE_MS) {
    return cachedBucketCheck.statuses;
  }
  const statuses = await checkStorageBuckets();
  cachedBucketCheck = { timestamp: now, statuses };
  return statuses;
}

export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string; path: string }> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  try {
    const statuses = await getBucketStatuses();
    const bucketStatus = statuses.find((s) => s.name === bucket);
    if (bucketStatus && !bucketStatus.exists) {
      throw new Error(`Storage bucket "${bucket}" not found. Create it in Supabase Dashboard → Storage → New bucket.`);
    }
  } catch (err) {
    console.error(`Bucket check failed for ${bucket}:`, err);
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error(`Supabase storage upload error [${bucket}/${path}]:`, error);
      if (error.message?.includes("bucket") || error.message?.includes("not found")) {
        throw new Error(`Storage bucket "${bucket}" not found. Create it in Supabase Dashboard → Storage.`);
      }
      if (error.message?.includes("CORS") || error.message?.includes("cors")) {
        throw new Error("CORS error: Check Supabase Storage CORS settings in Dashboard → Storage → Configuration.");
      }
      if (error.message?.includes("size") || error.message?.includes("limit") || String(error.statusCode) === "413") {
        throw new Error(`File too large for Supabase (${(file.size / 1024 / 1024).toFixed(1)}MB). Max is 50MB.`);
      }
      throw new Error(error.message || "Upload failed");
    }

    if (!data) {
      throw new Error("Upload completed but no data returned");
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: urlData.publicUrl, path: data.path };
  } catch (error) {
    console.error(`uploadToSupabaseStorage failed [${bucket}/${path}]:`, error);
    throw error;
  }
}

export async function deleteFromSupabaseStorage(
  bucket: string,
  path: string
): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error(`Supabase storage delete error [${bucket}/${path}]:`, error);
      throw new Error(error.message || "Delete failed");
    }
  } catch (error) {
    console.error(`deleteFromSupabaseStorage failed [${bucket}/${path}]:`, error);
    throw error;
  }
}
