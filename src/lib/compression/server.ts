/**
 * Server-side upload validation only.
 *
 * Image compression happens in the browser before the file is sent
 * (see lib/compression/client.ts), so uploaded images already arrive as WebP
 * bounded to 1MB / 1920px. This module deliberately performs no re-encoding: a
 * server-side pass added no value over that, and sharp's per-platform native
 * binaries failed to load on Vercel, which crashed the upload route outright.
 */
const MAX_GIF_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;
const MAX_IMAGE_SIZE_MB = 10;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const ALLOWED_UPLOAD_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export function isImageType(type: string | undefined): boolean {
  if (!type) return false;
  return type.startsWith("image/");
}

export function isVideoType(type: string | undefined): boolean {
  if (!type) return false;
  return type.startsWith("video/");
}

export function getMaxSizeForType(type: string | undefined): number {
  if (isVideoType(type)) return MAX_VIDEO_SIZE_MB;
  if (type === "image/gif") return MAX_GIF_SIZE_MB;
  return MAX_IMAGE_SIZE_MB;
}

export function validateUploadType(type: string | undefined): { valid: boolean; error?: { message: string; category: string } } {
  if (!type) return { valid: false, error: { message: "Unable to determine file type", category: "unsupported type" } };

  const isImage = isImageType(type);
  const isVideo = isVideoType(type);

  if (!isImage && !isVideo) {
    return { valid: false, error: { message: "Only image and video files are allowed", category: "unsupported type" } };
  }

  return { valid: true };
}

export function validateUploadSize(size: number, type: string | undefined): { valid: boolean; error?: { message: string; category: string } } {
  if (!size || size <= 0) return { valid: false, error: { message: "Invalid file size", category: "oversized file" } };

  const maxSize = getMaxSizeForType(type);
  const maxSizeBytes = maxSize * 1024 * 1024;

  if (size > maxSizeBytes) {
    return { valid: false, error: { message: `File size must be under ${maxSize}MB`, category: "oversized file" } };
  }

  return { valid: true };
}