import { compressFileClient } from "@/lib/compression/client";
import { getAcceptAttribute } from "@/lib/compression/client";
import { ASSET_CONFIG, AssetType, UploadResult } from "./types";
import { UploadError } from "./errors";

export async function uploadMedia(
  file: File,
  assetType: AssetType,
  metadata?: Record<string, string | number | boolean | null>,
): Promise<UploadResult> {
  const config = ASSET_CONFIG[assetType];

  if (!file) {
    throw UploadError.noFile();
  }

  const typeValid = config.allowedTypes.some((t) => file.type === t || file.type.startsWith(t.split("/")[0] + "/"));
  if (!typeValid) {
    throw UploadError.invalidType(file.type, config.allowedTypes);
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > config.maxFileSizeMB) {
    throw UploadError.tooLarge(sizeMB, config.maxFileSizeMB);
  }

  let uploadFile: File = file;

  const isGif = file.type === "image/gif";
  if (!isGif && file.type.startsWith("image/")) {
    try {
      uploadFile = await compressFileClient(file);
    } catch {
      uploadFile = file;
    }
  }

  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("assetType", assetType);
  if (metadata) {
    formData.append("metadata", JSON.stringify(metadata));
  }

  let response: Response;
  try {
    response = await fetch("/api/upload/media", {
      method: "POST",
      body: formData,
    });
  } catch {
    throw UploadError.network();
  }

  if (!response.ok) {
    let body: any = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }
    const error = body.error || "Upload failed";
    const details = body.details;
    const code = body.code || "UPLOAD_FAILED";
    const category = body.category;
    throw new UploadError(code, error, true, details, category);
  }

  const result: UploadResult = await response.json();
  return result;
}

export { getAcceptAttribute };
