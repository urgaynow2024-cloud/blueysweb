import { UploadError } from "@/lib/upload/errors";

describe("UploadError", () => {
  describe("noFile", () => {
    it("creates error with NO_FILE code", () => {
      const err = UploadError.noFile();
      expect(err.code).toBe("NO_FILE");
      expect(err.message).toBe("No file was selected");
      expect(err.actionable).toBe(true);
      expect(err.category).toBe("cancellation");
      expect(err.details).toBe("Please choose a file to upload.");
    });
  });

  describe("invalidType", () => {
    it("creates error with INVALID_TYPE code and category", () => {
      const err = UploadError.invalidType("application/pdf", ["image/jpeg", "image/png"]);
      expect(err.code).toBe("INVALID_TYPE");
      expect(err.message).toContain("application/pdf");
      expect(err.actionable).toBe(true);
      expect(err.category).toBe("unsupported type");
      expect(err.details).toContain("image/jpeg");
      expect(err.details).toContain("image/png");
    });
  });

  describe("tooLarge", () => {
    it("creates error with TOO_LARGE code and file name", () => {
      const err = UploadError.tooLarge(22, 15, "wisp-03.png");
      expect(err.code).toBe("TOO_LARGE");
      expect(err.message).toContain("wisp-03.png");
      expect(err.message).toContain("22.0MB");
      expect(err.message).toContain("15MB");
      expect(err.actionable).toBe(true);
      expect(err.category).toBe("oversized file");
    });

    it("creates error without file name when not provided", () => {
      const err = UploadError.tooLarge(20, 15);
      expect(err.message).not.toContain("undefined");
      expect(err.message).toContain("20.0MB");
    });
  });

  describe("dimensions", () => {
    it("creates error with INVALID_DIMENSIONS code", () => {
      const err = UploadError.dimensions(3000, 2000, 1920);
      expect(err.code).toBe("INVALID_DIMENSIONS");
      expect(err.message).toContain("3000x2000");
      expect(err.message).toContain("1920px");
      expect(err.category).toBe("invalid dimensions");
    });
  });

  describe("corrupted", () => {
    it("creates error with CORRUPTED code and file name", () => {
      const err = UploadError.corrupted("photo.png");
      expect(err.code).toBe("CORRUPTED");
      expect(err.message).toContain("photo.png");
      expect(err.category).toBe("corrupted image");
    });

    it("creates error without file name", () => {
      const err = UploadError.corrupted();
      expect(err.message).not.toContain("undefined");
      expect(err.code).toBe("CORRUPTED");
    });
  });

  describe("storage", () => {
    it("creates error with STORAGE_ERROR code and category", () => {
      const err = UploadError.storage("Bucket not found");
      expect(err.code).toBe("STORAGE_ERROR");
      expect(err.message).toBe("Upload to storage failed");
      expect(err.details).toBe("Bucket not found");
      expect(err.category).toBe("storage failure");
    });

    it("creates error without details", () => {
      const err = UploadError.storage();
      expect(err.details).toBeUndefined();
    });
  });

  describe("database", () => {
    it("creates error with DB_ERROR code and category", () => {
      const err = UploadError.database("Connection failed");
      expect(err.code).toBe("DB_ERROR");
      expect(err.message).toBe("Failed to save upload record");
      expect(err.category).toBe("DB failure");
    });
  });

  describe("network", () => {
    it("creates error with NETWORK_ERROR code and category", () => {
      const err = UploadError.network();
      expect(err.code).toBe("NETWORK_ERROR");
      expect(err.category).toBe("network failure");
      expect(err.message).toBe("Network error during upload");
    });
  });

  describe("timeout", () => {
    it("creates error with TIMEOUT code and category", () => {
      const err = UploadError.timeout();
      expect(err.code).toBe("TIMEOUT");
      expect(err.category).toBe("timeout");
    });
  });

  describe("config", () => {
    it("creates error with CONFIG_ERROR code and category", () => {
      const err = UploadError.config();
      expect(err.code).toBe("CONFIG_ERROR");
      expect(err.category).toBe("invalid configuration");
    });
  });

  describe("instanceof", () => {
    it("is an instance of Error", () => {
      const err = UploadError.noFile();
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(UploadError);
    });
  });
});