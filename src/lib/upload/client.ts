import { compressFileClient } from "@/lib/compression/client";
import { getAcceptAttribute } from "@/lib/compression/client";
import { ASSET_CONFIG, AssetType, UploadResult, UploadProgress } from "./types";
import { UploadError } from "./errors";

export async function uploadMedia(
  file: File,
  assetType: AssetType,
  metadata?: Record<string, string | number | boolean | null>,
  onProgress?: (progress: UploadProgress) => void,
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

  if (onProgress) {
    return uploadWithProgress(formData, onProgress);
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

  return parseResponse(response);
}

function parseResponse(response: Response): Promise<UploadResult> {
  if (!response.ok) {
    return response.json().then((body: any) => {
      const error = body?.error || "Upload failed";
      const details = body?.details;
      const code = body?.code || "UPLOAD_FAILED";
      const category = body?.category;
      throw new UploadError(code, error, true, details, category);
    }).catch((err) => {
      if (err instanceof UploadError) throw err;
      throw new UploadError("UPLOAD_FAILED", "Upload failed", true);
    });
  }
  return response.json() as Promise<UploadResult>;
}

function uploadWithProgress(formData: FormData, onProgress: (progress: UploadProgress) => void): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/media");
    xhr.upload.onprogress = (e: ProgressEvent) => {
      if (e.lengthComputable) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100),
        });
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText) as UploadResult;
          resolve(result);
        } catch {
          reject(new UploadError("UPLOAD_FAILED", "Invalid upload response", true));
        }
      } else {
        try {
          const body = JSON.parse(xhr.responseText) as any;
          reject(new UploadError(body?.code || "UPLOAD_FAILED", body?.error || "Upload failed", true, body?.details, body?.category));
        } catch {
          reject(new UploadError("UPLOAD_FAILED", "Upload failed", true));
        }
      }
    };
    xhr.onerror = () => reject(UploadError.network());
    xhr.send(formData);
  });
}

export { getAcceptAttribute };
