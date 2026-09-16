"use client";

import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp" as const,
};

export async function compressFileClient(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
    return compressed;
  } catch (error) {
    console.error("Client-side compression failed:", error);
    throw new Error("Failed to compress image. Please try a different image.");
  }
}

export function getAcceptAttribute(): string {
  return "image/*,video/mp4,video/webm,video/quicktime";
}
