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

function describeUnparsedResponse(status: number, statusText: string, raw: string): string {
  const body = raw.replace(/\s+/g, " ").trim().slice(0, 300);
  return `HTTP ${status}${statusText ? ` ${statusText}` : ""}${body ? ` — ${body}` : " (empty body)"}`;
}

/**
 * Reads an error body as JSON when possible, keeping the raw text when it is not
 * parseable. A proxy or platform error page carries the real cause, so it must
 * not be discarded in favour of a generic message.
 */
async function readErrorBody(response: Response): Promise<{ body: any | null; raw: string }> {
  const text = typeof response.text === "function" ? response.text.bind(response) : null;
  if (text) {
    try {
      const raw = await text();
      const trimmed = raw.trim();
      if (!trimmed) return { body: null, raw: "" };
      try {
        return { body: JSON.parse(trimmed), raw: trimmed };
      } catch {
        return { body: null, raw: trimmed };
      }
    } catch {
      /* fall through to json() */
    }
  }
  if (typeof response.json === "function") {
    try {
      return { body: await response.json(), raw: "" };
    } catch {
      /* unreadable */
    }
  }
  return { body: null, raw: "" };
}

async function parseResponse(response: Response): Promise<UploadResult> {
  if (!response.ok) {
    const { body, raw } = await readErrorBody(response);
    if (!body && !raw) {
      throw new UploadError("UPLOAD_FAILED", "Upload failed", true, describeUnparsedResponse(response.status, response.statusText, ""));
    }
    if (!body) {
      throw new UploadError("UPLOAD_FAILED", "Upload failed", true, `Non-JSON response: ${describeUnparsedResponse(response.status, response.statusText, raw)}`);
    }
    const details = body?.details;
    const error = body?.error || (details ? `Upload failed: ${details}` : "Upload failed");
    throw new UploadError(body?.code || "UPLOAD_FAILED", error, true, details, body?.category);
  }
  try {
    return await response.json();
  } catch {
    throw new UploadError("UPLOAD_FAILED", "Upload failed", true, describeUnparsedResponse(response.status, response.statusText, ""));
  }
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
          reject(new UploadError("UPLOAD_FAILED", "Upload failed", true, `Server returned HTTP ${xhr.status} with a non-JSON body: ${(xhr.responseText || "").slice(0, 300)}`));
        }
      } else {
        const raw = xhr.responseText || "";
        if (!raw.trim()) {
          reject(new UploadError("UPLOAD_FAILED", "Upload failed", true, `Server returned HTTP ${xhr.status} with an empty body.`));
          return;
        }
        try {
          const body = JSON.parse(raw);
          reject(new UploadError(body?.code || "UPLOAD_FAILED", body?.error || "Upload failed", true, body?.details, body?.category));
        } catch {
          reject(new UploadError("UPLOAD_FAILED", "Upload failed", true, `HTTP ${xhr.status} non-JSON response: ${raw.replace(/\s+/g, " ").slice(0, 300)}`));
        }
      }
    };
    xhr.onerror = () => reject(UploadError.network());
    xhr.send(formData);
  });
}

export { getAcceptAttribute };
