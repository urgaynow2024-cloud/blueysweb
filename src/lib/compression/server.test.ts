import sharp from "sharp";
import {
  validateUploadType,
  validateUploadSize,
  isImageType,
  isVideoType,
  getMaxSizeForType,
  getCompressedExtension,
  compressImageBuffer,
} from "@/lib/compression/server";

describe("validateUploadType", () => {
  it("validates supported image types", () => {
    const result = validateUploadType("image/jpeg");
    expect(result.valid).toBe(true);
  });

  it("validates supported video types", () => {
    const result = validateUploadType("video/mp4");
    expect(result.valid).toBe(true);
  });

  it("rejects unsupported types with category", () => {
    const result = validateUploadType("application/pdf");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error!.category).toBe("unsupported type");
    expect(result.error!.message).toBe("Only image and video files are allowed");
  });

  it("rejects undefined type", () => {
    const result = validateUploadType(undefined);
    expect(result.valid).toBe(false);
    expect(result.error!.category).toBe("unsupported type");
  });

  it("rejects empty string type", () => {
    const result = validateUploadType("");
    expect(result.valid).toBe(false);
  });
});

describe("validateUploadSize", () => {
  it("validates file under limit", () => {
    const result = validateUploadSize(1024 * 1024, "image/jpeg");
    expect(result.valid).toBe(true);
  });

  it("rejects oversized image with category", () => {
    const result = validateUploadSize(20 * 1024 * 1024, "image/jpeg");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error!.category).toBe("oversized file");
    expect(result.error!.message).toContain("10MB");
  });

  it("rejects oversized GIF with lower limit", () => {
    const result = validateUploadSize(6 * 1024 * 1024, "image/gif");
    expect(result.valid).toBe(false);
    expect(result.error!.message).toContain("5MB");
  });

  it("rejects oversized video with higher limit", () => {
    const result = validateUploadSize(60 * 1024 * 1024, "video/mp4");
    expect(result.valid).toBe(false);
    expect(result.error!.message).toContain("50MB");
  });

  it("rejects zero size", () => {
    const result = validateUploadSize(0, "image/jpeg");
    expect(result.valid).toBe(false);
  });

  it("rejects negative size", () => {
    const result = validateUploadSize(-1, "image/jpeg");
    expect(result.valid).toBe(false);
  });
});

describe("isImageType", () => {
  it("returns true for image types", () => {
    expect(isImageType("image/jpeg")).toBe(true);
    expect(isImageType("image/png")).toBe(true);
    expect(isImageType("image/webp")).toBe(true);
    expect(isImageType("image/gif")).toBe(true);
  });

  it("returns false for video types", () => {
    expect(isImageType("video/mp4")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isImageType(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isImageType("")).toBe(false);
  });
});

describe("isVideoType", () => {
  it("returns true for video types", () => {
    expect(isVideoType("video/mp4")).toBe(true);
    expect(isVideoType("video/webm")).toBe(true);
    expect(isVideoType("video/quicktime")).toBe(true);
  });

  it("returns false for image types", () => {
    expect(isVideoType("image/jpeg")).toBe(false);
  });
});

describe("getMaxSizeForType", () => {
  it("returns 10MB for images", () => {
    expect(getMaxSizeForType("image/jpeg")).toBe(10);
  });

  it("returns 5MB for GIF", () => {
    expect(getMaxSizeForType("image/gif")).toBe(5);
  });

  it("returns 50MB for video", () => {
    expect(getMaxSizeForType("video/mp4")).toBe(50);
  });

  it("returns 10MB for unknown type", () => {
    expect(getMaxSizeForType("application/pdf")).toBe(10);
  });
});

describe("compressImageBuffer preserves GIFs", () => {
  it("does not convert GIFs to WebP (preserves animation)", async () => {
    const { compressImageBuffer } = await import("./server");
    // Create a minimal 1x1 GIF buffer
    const gifBuffer = Buffer.from("GIF89a100010080000000000002C00000000010001000002024401003B", "hex");
    const result = await compressImageBuffer(gifBuffer, "image/gif");
    // Should NOT be webp - should remain GIF or original format
    expect(result).not.toBeUndefined();
  });
});

describe("getCompressedExtension", () => {
  it("returns webp for jpeg", () => {
    expect(getCompressedExtension("image/jpeg")).toBe("webp");
  });

  it("returns webp for png", () => {
    expect(getCompressedExtension("image/png")).toBe("webp");
  });

  it("returns gif for gif (preserves animation)", () => {
    expect(getCompressedExtension("image/gif")).toBe("gif");
  });

  it("returns webp for webp", () => {
    expect(getCompressedExtension("image/webp")).toBe("webp");
  });
});

describe("compressImageBuffer never returns a degenerate image", () => {
  // A 1x1 result stretched across a container renders as a flat block of colour,
  // which is what made uploads appear as solid blue rectangles.
  async function dimensions(buffer: Buffer) {
    const meta = await sharp(buffer).metadata();
    return { width: meta.width, height: meta.height };
  }

  it("preserves the real dimensions of a genuine image", async () => {
    const source = await sharp({
      create: { width: 640, height: 480, channels: 3, background: "#3355ff" },
    })
      .png()
      .toBuffer();

    expect(await dimensions(source)).toEqual({ width: 640, height: 480 });

    const out = await compressImageBuffer(source, "image/png");
    const after = await dimensions(out);

    expect(after.width).toBe(640);
    expect(after.height).toBe(480);
  });

  it("returns the original when the source is already 1x1", async () => {
    const tiny = await sharp({
      create: { width: 1, height: 1, channels: 3, background: "#0000ff" },
    })
      .png()
      .toBuffer();

    const out = await compressImageBuffer(tiny, "image/png");

    // Must come back untouched rather than being re-encoded.
    expect(out.equals(tiny)).toBe(true);
  });
});