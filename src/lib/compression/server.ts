import type sharp from "sharp";

const MAX_IMAGE_DIMENSION = 1920;
const MAX_IMAGE_QUALITY = 80;
const MAX_GIF_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;
const MAX_IMAGE_SIZE_MB = 10;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const ALLOWED_UPLOAD_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

/**
 * sharp ships native binaries per platform. A static top-level import makes the
 * whole module unresolvable when the binary for the current runtime is missing,
 * which crashes every route that imports it with ERR_DLOPEN_FAILED instead of
 * failing one call. Loading it lazily keeps that failure contained.
 */
let sharpModule: typeof sharp | null | undefined;

async function loadSharp(): Promise<typeof sharp | null> {
  if (sharpModule !== undefined) return sharpModule;
  try {
    const mod = await import("sharp");
    const resolved = (mod.default ?? mod) as typeof sharp;
    // Touch the module so a bad binary throws here rather than mid-pipeline.
    await resolved({ create: { width: 1, height: 1, channels: 3, background: "#000" } }).png().toBuffer();
    sharpModule = resolved;
  } catch (error) {
    console.warn("sharp is unavailable on this runtime; server-side image compression is disabled.", error);
    sharpModule = null;
  }
  return sharpModule;
}

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

/**
 * Reports whether server-side compression can actually run. Callers must not
 * label a buffer as WebP when this is false, or the object is stored with a
 * content type that does not match its bytes.
 */
export async function isCompressionAvailable(): Promise<boolean> {
  return (await loadSharp()) !== null;
}

export async function compressImageBuffer(buffer: Buffer, mimeType: string): Promise<Buffer> {
  const sharpLib = await loadSharp();
  if (!sharpLib) return buffer;

  try {
    if (mimeType === "image/gif") {
      const metadata = await sharpLib(buffer).metadata();
      if (metadata.width && metadata.height && (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION)) {
        return sharpLib(buffer)
          .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .gif()
          .toBuffer();
      }
      return buffer;
    }

    return sharpLib(buffer)
      .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: MAX_IMAGE_QUALITY })
      .toBuffer();
  } catch (error) {
    console.error("Image compression failed:", error);
    return buffer;
  }
}

export function getCompressedExtension(mimeType: string): string {
  if (mimeType === "image/gif") return "gif";
  return "webp";
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
