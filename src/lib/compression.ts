import sharp from "sharp";

const MAX_IMAGE_DIMENSION = 1920;
const MAX_IMAGE_QUALITY = 80;
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

export async function compressImageBuffer(buffer: Buffer, mimeType: string): Promise<Buffer> {
  try {
    if (mimeType === "image/gif") {
      const metadata = await sharp(buffer).metadata();
      if (metadata.width && metadata.height && (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION)) {
        return sharp(buffer)
          .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: MAX_IMAGE_QUALITY })
          .toBuffer();
      }
      return buffer;
    }

    return sharp(buffer)
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
  if (mimeType === "image/gif") return "webp";
  if (mimeType === "image/png") return "webp";
  if (mimeType === "image/jpeg") return "webp";
  return "webp";
}

export function validateUploadType(type: string | undefined): { valid: boolean; error?: string } {
  if (!type) return { valid: false, error: "Unable to determine file type" };

  const isImage = isImageType(type);
  const isVideo = isVideoType(type);

  if (!isImage && !isVideo) {
    return { valid: false, error: "Only image and video files are allowed" };
  }

  return { valid: true };
}

export function validateUploadSize(size: number, type: string | undefined): { valid: boolean; error?: string } {
  if (!size || size <= 0) return { valid: false, error: "Invalid file size" };

  const maxSize = getMaxSizeForType(type);
  const maxSizeBytes = maxSize * 1024 * 1024;

  if (size > maxSizeBytes) {
    return { valid: false, error: `File size must be under ${maxSize}MB` };
  }

  return { valid: true };
}
