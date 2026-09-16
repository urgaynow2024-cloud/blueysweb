export type AssetType =
  | "portfolio"
  | "nsfw"
  | "adoptable-main"
  | "adoptable-gallery"
  | "adoptable-before"
  | "adoptable-after"
  | "site"
  | "review"
  | "credit-avatar";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  id: string;
  url: string;
  path: string;
}

export interface UploadError {
  code: string;
  message: string;
  actionable: boolean;
  details?: string;
  category?: string;
}

export interface UploadState {
  status: "idle" | "compressing" | "uploading" | "success" | "error";
  progress?: UploadProgress;
  result?: UploadResult;
  error?: UploadError;
}

export interface UploadConfig {
  maxFileSizeMB: number;
  allowedTypes: string[];
  bucket: string;
  storagePrefix: string;
}

export const ASSET_CONFIG: Record<AssetType, UploadConfig> = {
  portfolio: { maxFileSizeMB: 50, allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"], bucket: "portfolio-images", storagePrefix: "portfolio" },
  nsfw: { maxFileSizeMB: 50, allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"], bucket: "portfolio-images", storagePrefix: "nsfw" },
  "adoptable-main": { maxFileSizeMB: 20, allowedTypes: ["image/jpeg", "image/png", "image/webp"], bucket: "portfolio-images", storagePrefix: "adoptables" },
  "adoptable-gallery": { maxFileSizeMB: 50, allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"], bucket: "portfolio-images", storagePrefix: "adoptables" },
  "adoptable-before": { maxFileSizeMB: 50, allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"], bucket: "portfolio-images", storagePrefix: "adoptables" },
  "adoptable-after": { maxFileSizeMB: 50, allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"], bucket: "portfolio-images", storagePrefix: "adoptables" },
  site: { maxFileSizeMB: 10, allowedTypes: ["image/jpeg", "image/png", "image/webp"], bucket: "portfolio-images", storagePrefix: "site" },
  review: { maxFileSizeMB: 20, allowedTypes: ["image/jpeg", "image/png", "image/webp"], bucket: "portfolio-images", storagePrefix: "reviews" },
  "credit-avatar": { maxFileSizeMB: 20, allowedTypes: ["image/jpeg", "image/png", "image/webp"], bucket: "portfolio-images", storagePrefix: "credits" },
};
