import {
  describeMediaProblem,
  isRenderableImageUrl,
  pickAdoptableArtwork,
  pickHeroArtwork,
  publicUrlForPath,
  resolveMediaUrl,
} from "@/lib/adoptables/images";
import type { Adoptable, AdoptableGalleryImage } from "@/types/database";

const SUPABASE_URL = "https://project.supabase.co";
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/portfolio-images`;

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
});

function adoptable(overrides: Partial<Adoptable> = {}): Adoptable {
  return {
    id: "a1",
    title: "Cedar",
    availability: "available",
    ...overrides,
  } as Adoptable;
}

function galleryImage(overrides: Partial<AdoptableGalleryImage> = {}): AdoptableGalleryImage {
  return {
    id: "g1",
    adoptable_id: "a1",
    url: `${PUBLIC_BASE}/adoptables/one.webp`,
    sort_order: 0,
    is_nsfw: false,
    ...overrides,
  } as AdoptableGalleryImage;
}

describe("resolveMediaUrl", () => {
  it("keeps a working public URL untouched", () => {
    const url = `${PUBLIC_BASE}/adoptables/one.webp`;
    expect(resolveMediaUrl(url, "adoptables/one.webp")).toBe(url);
  });

  it("derives a public URL from the storage path when the URL is missing", () => {
    expect(resolveMediaUrl(null, "adoptables/main-1.webp")).toBe(
      `${PUBLIC_BASE}/adoptables/main-1.webp`,
    );
  });

  it("repairs a URL that points at the private bucket", () => {
    const broken = `${SUPABASE_URL}/storage/v1/object/public/adoptables/one.webp`;
    expect(resolveMediaUrl(broken, "adoptables/one.webp")).toBe(
      `${PUBLIC_BASE}/adoptables/one.webp`,
    );
  });

  it("repairs an expired signed URL", () => {
    const signed = `${SUPABASE_URL}/storage/v1/object/sign/adoptables/one.webp?token=abc`;
    expect(resolveMediaUrl(signed, "adoptables/one.webp")).toBe(
      `${PUBLIC_BASE}/adoptables/one.webp`,
    );
  });

  it("treats a bare storage path in the url column as a path", () => {
    expect(resolveMediaUrl("adoptables/one.webp", null)).toBe(`${PUBLIC_BASE}/adoptables/one.webp`);
  });

  it("prefers a working remote URL over the storage path", () => {
    // The CDN URL loads, so it wins. The path is only a fallback for when the
    // stored reference cannot be rendered at all.
    expect(resolveMediaUrl("https://example.com/x.png", "adoptables/deep/two.png")).toBe(
      "https://example.com/x.png",
    );
  });

  it("uses the derived URL when the stored reference is unusable", () => {
    const dead = `${SUPABASE_URL}/storage/v1/object/public/adoptables/gone.webp`;
    expect(resolveMediaUrl(dead, "adoptables/deep/two.png")).toBe(
      `${PUBLIC_BASE}/adoptables/deep/two.png`,
    );
  });

  it("re-extracts the path from a full object URL", () => {
    const source = `${SUPABASE_URL}/storage/v1/object/public/adoptables/deep/two.png`;
    expect(resolveMediaUrl(null, source)).toBe(`${PUBLIC_BASE}/adoptables/deep/two.png`);
  });

  it("returns null rather than an unloadable URL", () => {
    expect(resolveMediaUrl(null, null)).toBeNull();
    expect(resolveMediaUrl("", "")).toBeNull();
    expect(resolveMediaUrl("https://cdn.example.com/clip.mp4", null)).toBeNull();
  });

  it("keeps remote CDN images that are real images", () => {
    const cdn = "https://cdn.example.com/art/one.webp";
    expect(resolveMediaUrl(cdn, null)).toBe(cdn);
  });
});

describe("isRenderableImageUrl", () => {
  it("rejects videos so they never land in an artwork frame", () => {
    expect(isRenderableImageUrl("https://x.com/a.mp4")).toBe(false);
    expect(isRenderableImageUrl("https://x.com/a.webm")).toBe(false);
    expect(isRenderableImageUrl("https://x.com/a.MP4?token=1")).toBe(false);
  });

  it("rejects signed and expired object endpoints", () => {
    expect(isRenderableImageUrl(`${SUPABASE_URL}/storage/v1/object/sign/bucket/a.webp`)).toBe(false);
  });

  it("accepts real images and data URIs", () => {
    expect(isRenderableImageUrl(`${PUBLIC_BASE}/a.webp`)).toBe(true);
    expect(isRenderableImageUrl("data:image/png;base64,AAAA")).toBe(true);
  });

  it("accepts objects stored under an opaque name", () => {
    // The live gallery on this project is full of `<uuid>.blob` objects that
    // serve image/webp, so an extension check would discard real artwork.
    expect(isRenderableImageUrl(`${PUBLIC_BASE}/adoptables/6143997d-a4cb.blob`)).toBe(true);
    expect(resolveMediaUrl(`${PUBLIC_BASE}/adoptables/6143997d-a4cb.blob`, null)).toBe(
      `${PUBLIC_BASE}/adoptables/6143997d-a4cb.blob`,
    );
  });

  it("rejects empty and relative values", () => {
    expect(isRenderableImageUrl("")).toBe(false);
    expect(isRenderableImageUrl(null)).toBe(false);
    expect(isRenderableImageUrl("adoptables/a.webp")).toBe(false);
  });
});

describe("pickAdoptableArtwork", () => {
  it("prefers the main image", () => {
    const result = pickAdoptableArtwork(
      adoptable({ main_image: `${PUBLIC_BASE}/adoptables/main.webp`, main_image_path: "adoptables/main.webp" }),
      [galleryImage()],
    );
    expect(result).toMatchObject({ source: "main" });
    expect(result?.url).toBe(`${PUBLIC_BASE}/adoptables/main.webp`);
  });

  it("falls back to the first SFW gallery image", () => {
    const result = pickAdoptableArtwork(adoptable(), [
      galleryImage({ id: "n", url: `${PUBLIC_BASE}/nsfw.webp`, is_nsfw: true }),
      galleryImage({ id: "s", url: `${PUBLIC_BASE}/sfw.webp` }),
    ]);
    expect(result?.url).toBe(`${PUBLIC_BASE}/sfw.webp`);
  });

  it("skips gallery entries that cannot be rendered", () => {
    const result = pickAdoptableArtwork(adoptable(), [
      galleryImage({ id: "v", url: "https://x.com/clip.mp4" }),
      galleryImage({ id: "s", url: `${PUBLIC_BASE}/sfw.webp` }),
    ]);
    expect(result?.url).toBe(`${PUBLIC_BASE}/sfw.webp`);
  });

  it("returns null when there is nothing to show, so callers can fall back", () => {
    expect(pickAdoptableArtwork(adoptable(), [])).toBeNull();
    expect(pickAdoptableArtwork(null, [])).toBeNull();
    expect(pickAdoptableArtwork(adoptable({ main_image: "" }), [])).toBeNull();
  });

  it("recovers artwork when only a path was stored", () => {
    const result = pickAdoptableArtwork(adoptable({ main_image_path: "adoptables/x.webp" }), []);
    expect(result?.url).toBe(`${PUBLIC_BASE}/adoptables/x.webp`);
  });

  it("falls back to gallery artwork when no main image is stored", () => {
    // Regression: the admin card used to render `adoptable.main_image` directly,
    // so this case produced an empty artwork frame even though a perfectly
    // loadable gallery image existed. It is the common case, because the main
    // image is optional.
    const result = pickAdoptableArtwork(adoptable(), [galleryImage()]);
    expect(result).toMatchObject({ source: "gallery" });
    expect(result?.url).toBe(`${PUBLIC_BASE}/adoptables/one.webp`);
  });

  it("carries the gallery row so its storage path can be used for retry", () => {
    // AdoptableCard passes `galleryImage.path` back in as the `path` prop, which
    // is what lets the frame recover if the stored URL 404s.
    const row = galleryImage({ path: "adoptables/one.webp" } as Partial<AdoptableGalleryImage>);
    const result = pickAdoptableArtwork(adoptable(), [row]);
    expect(result?.galleryImage?.path).toBe("adoptables/one.webp");
    expect(resolveMediaUrl(result!.url, result!.galleryImage?.path)).toBe(result!.url);
  });

  it("does not report a problem when only gallery artwork exists", () => {
    // describeMediaProblem only inspects the main image columns, so the card
    // must gate it behind a successful pick rather than showing it directly.
    const artwork = pickAdoptableArtwork(adoptable(), [galleryImage()]);
    expect(artwork).not.toBeNull();
    expect(describeMediaProblem(adoptable().main_image, adoptable().main_image_path)).toMatch(
      /no artwork/i,
    );
  });
});

describe("pickHeroArtwork", () => {
  const artworkFor = (id: string, title: string) =>
    adoptable({ id, title, main_image: `${PUBLIC_BASE}/adoptables/${id}.webp`, main_image_path: `adoptables/${id}.webp` });

  it("prefers an available adoptable", () => {
    const sold = artworkFor("s", "Sold One");
    sold.availability = "sold";
    const available = artworkFor("a", "Available One");
    available.availability = "available";

    expect(pickHeroArtwork([sold, available])?.adoptable.id).toBe("a");
  });

  it("prefers a featured adoptable over a merely available one", () => {
    const plain = artworkFor("p", "Plain");
    const featured = artworkFor("f", "Featured");
    featured.featured = true;
    expect(pickHeroArtwork([plain, featured])?.adoptable.id).toBe("f");
  });

  it("prefers an available adoptable when nothing is featured", () => {
    const pending = artworkFor("p", "Pending");
    pending.availability = "pending";
    const available = artworkFor("a", "Available");
    available.availability = "available";
    expect(pickHeroArtwork([pending, available])?.adoptable.id).toBe("a");
  });

  it("still fills the hero when everything is sold", () => {
    const sold = artworkFor("s", "Sold");
    sold.availability = "sold";
    expect(pickHeroArtwork([sold])?.adoptable.id).toBe("s");
  });

  it("ignores adoptables with no renderable artwork", () => {
    expect(pickHeroArtwork([adoptable({ id: "x", title: "No art" })])).toBeNull();
    expect(pickHeroArtwork([])).toBeNull();
  });
});

describe("describeMediaProblem", () => {
  it("returns null when the artwork resolves", () => {
    expect(describeMediaProblem(`${PUBLIC_BASE}/a.webp`)).toBeNull();
  });

  it("explains a missing upload", () => {
    expect(describeMediaProblem(null, null)).toMatch(/no artwork/i);
  });

  it("explains an unusable video", () => {
    expect(describeMediaProblem("https://x.com/a.mp4", null)).toMatch(/video/i);
  });

  it("recovers the path from a signed URL rather than giving up", () => {
    const signed = `${SUPABASE_URL}/storage/v1/object/sign/portfolio-images/a.webp?token=abc`;
    expect(resolveMediaUrl(signed, null)).toBe(`${PUBLIC_BASE}/a.webp`);
  });

  it("reports a problem when nothing can be derived", () => {
    expect(describeMediaProblem("not-a-url-at-all", null)).toMatch(/re-upload/i);
  });
});

describe("publicUrlForPath", () => {
  it("builds a public object URL", () => {
    expect(publicUrlForPath("adoptables/a.webp")).toBe(`${PUBLIC_BASE}/adoptables/a.webp`);
  });

  it("tolerates a leading slash", () => {
    expect(publicUrlForPath("/adoptables/a.webp")).toBe(`${PUBLIC_BASE}/adoptables/a.webp`);
  });

  it("returns null for empty input", () => {
    expect(publicUrlForPath(null)).toBeNull();
    expect(publicUrlForPath("")).toBeNull();
  });
});