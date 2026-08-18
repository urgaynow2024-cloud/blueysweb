"use client";

import { supabase } from "@/lib/supabase";

export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string; path: string }> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (error || !data) {
    throw new Error(error?.message || "Upload failed");
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { url: urlData.publicUrl, path: data.path };
}

export async function deleteFromSupabaseStorage(
  bucket: string,
  path: string
): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(error.message || "Delete failed");
  }
}
