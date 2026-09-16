import { UploadError } from "@/lib/upload/errors";
import { uploadMedia } from "@/lib/upload/client";

// Mock compression client
jest.mock("@/lib/compression/client", () => ({
  compressFileClient: jest.fn().mockImplementation((file: File) => Promise.resolve(file)),
  getAcceptAttribute: () => "image/*",
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("uploadMedia", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("throws UploadError.noFile() when no file provided", async () => {
    await expect(uploadMedia(null as any, "portfolio")).rejects.toThrow(UploadError);
    try {
      await uploadMedia(null as any, "portfolio");
    } catch (e) {
      expect(e).toBeInstanceOf(UploadError);
      expect((e as UploadError).code).toBe("NO_FILE");
      expect((e as UploadError).category).toBe("cancellation");
    }
  });

  it("throws UploadError.invalidType for unsupported file type", async () => {
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    await expect(uploadMedia(file, "portfolio")).rejects.toThrow(UploadError);
    try {
      await uploadMedia(file, "portfolio");
    } catch (e) {
      expect(e).toBeInstanceOf(UploadError);
      expect((e as UploadError).category).toBe("unsupported type");
    }
  });

  it("throws UploadError.tooLarge for oversized file", async () => {
    const largeFile = new File(["x".repeat(60 * 1024 * 1024)], "large.png", { type: "image/png" });
    await expect(uploadMedia(largeFile, "portfolio")).rejects.toThrow(UploadError);
    try {
      await uploadMedia(largeFile, "portfolio");
    } catch (e) {
      expect(e).toBeInstanceOf(UploadError);
      expect((e as UploadError).category).toBe("oversized file");
    }
  });

  it("throws UploadError.network() on fetch failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    const file = new File(["content"], "test.png", { type: "image/png" });
    await expect(uploadMedia(file, "portfolio")).rejects.toThrow(UploadError);
    try {
      await uploadMedia(file, "portfolio");
    } catch (e) {
      expect(e).toBeInstanceOf(UploadError);
      expect((e as UploadError).category).toBe("network failure");
    }
  });

  it("throws UploadError on non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Upload failed", code: "STORAGE_ERROR", category: "storage failure" }),
    });
    const file = new File(["content"], "test.png", { type: "image/png" });
    await expect(uploadMedia(file, "portfolio")).rejects.toThrow(UploadError);
    try {
      await uploadMedia(file, "portfolio");
    } catch (e) {
      expect(e).toBeInstanceOf(UploadError);
      expect((e as UploadError).code).toBe("STORAGE_ERROR");
      expect((e as UploadError).category).toBe("storage failure");
    }
  });

  it("throws UploadError on generic error response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
    });
    const file = new File(["content"], "test.png", { type: "image/png" });
    await expect(uploadMedia(file, "portfolio")).rejects.toThrow(UploadError);
    try {
      await uploadMedia(file, "portfolio");
    } catch (e) {
      expect(e).toBeInstanceOf(UploadError);
      expect((e as UploadError).code).toBe("UPLOAD_FAILED");
    }
  });

  it("returns UploadResult on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "123", url: "https://example.com/test.png", path: "portfolio/test.png" }),
    });
    const file = new File(["content"], "test.png", { type: "image/png" });
    const result = await uploadMedia(file, "portfolio");
    expect(result.id).toBe("123");
    expect(result.url).toBe("https://example.com/test.png");
    expect(result.path).toBe("portfolio/test.png");
  });
});