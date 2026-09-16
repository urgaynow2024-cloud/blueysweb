export class UploadError extends Error {
  code: string;
  actionable: boolean;
  details?: string;
  category?: string;

  constructor(code: string, message: string, actionable = false, details?: string, category?: string) {
    super(message);
    this.name = "UploadError";
    this.code = code;
    this.actionable = actionable;
    this.details = details;
    this.category = category;
  }

  static noFile(): UploadError {
    return new UploadError("NO_FILE", "No file was selected", true, "Please choose a file to upload.", "cancellation");
  }

  static invalidType(fileType: string, allowedTypes: string[]): UploadError {
    return new UploadError("INVALID_TYPE", `File type ${fileType} is not supported`, true, `Allowed types: ${allowedTypes.join(", ")}`, "unsupported type");
  }

  static tooLarge(sizeMB: number, maxMB: number, fileName?: string): UploadError {
    const namePart = fileName ? ` ${fileName}` : "";
    return new UploadError("TOO_LARGE", `File${namePart} is ${sizeMB.toFixed(1)}MB (max ${maxMB}MB)`, true, "Please compress the image or choose a smaller file.", "oversized file");
  }

  static dimensions(width: number, height: number, maxDimension: number): UploadError {
    return new UploadError("INVALID_DIMENSIONS", `Image dimensions ${width}x${height} exceed the maximum allowed ${maxDimension}px`, true, "Please resize the image before uploading.", "invalid dimensions");
  }

  static corrupted(fileName?: string): UploadError {
    const namePart = fileName ? ` ${fileName}` : "";
    return new UploadError("CORRUPTED", `File${namePart} appears to be corrupted or unreadable`, true, "Please try a different file.", "corrupted image");
  }

  static storage(message?: string): UploadError {
    return new UploadError("STORAGE_ERROR", "Upload to storage failed", true, message, "storage failure");
  }

  static database(message?: string): UploadError {
    return new UploadError("DB_ERROR", "Failed to save upload record", true, message, "DB failure");
  }

  static network(): UploadError {
    return new UploadError("NETWORK_ERROR", "Network error during upload", true, "Check your connection and try again.", "network failure");
  }

  static timeout(): UploadError {
    return new UploadError("TIMEOUT", "Upload timed out", true, "The file is too large or your connection is slow. Please try again.", "timeout");
  }

  static config(): UploadError {
    return new UploadError("CONFIG_ERROR", "Server is not configured", true, "Contact the site administrator.", "invalid configuration");
  }
}
