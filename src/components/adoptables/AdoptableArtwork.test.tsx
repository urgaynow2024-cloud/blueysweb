import { render, screen, fireEvent } from "@testing-library/react";
import { AdoptableArtwork } from "@/components/adoptables/AdoptableArtwork";

/**
 * Regression tests for the 1x1 placeholder class of failure.
 *
 * Uploads once stored a 94-byte 1x1 WebP of RGB(0,1,255) instead of the real
 * artwork. The browser loads it successfully — HTTP 200, decodes fine, no
 * console error — then stretches the single pixel across the whole container,
 * producing a large flat blue rectangle that looks like a broken image but is
 * actually a *successful* load. `onError` cannot catch it, which is why these
 * tests drive the `onLoad` path and assert on the decoded intrinsic size.
 */

function loadWithSize(img: HTMLElement, width: number, height: number) {
  Object.defineProperty(img, "naturalWidth", { value: width, configurable: true });
  Object.defineProperty(img, "naturalHeight", { value: height, configurable: true });
  fireEvent.load(img);
}

describe("AdoptableArtwork 1x1 placeholder guard", () => {
  it("renders a real image when the decoded size is normal", () => {
    const { container } = render(
      <AdoptableArtwork url="https://cdn.example.com/art.webp" alt="Cedar" wrapperClassName="frame" />,
    );
    const img = container.querySelector("img")!;
    loadWithSize(img, 1200, 1500);
    expect(screen.queryByText("Artwork unavailable")).not.toBeInTheDocument();
    expect(container.querySelector("img")).toBeInTheDocument();
  });

  it("rejects a 1x1 image even though it loaded without error", () => {
    // This is the exact corruption: a 94-byte 1x1 WebP. It must NOT be shown as
    // artwork, because displaying it is what produced the solid blue block.
    const { container } = render(
      <AdoptableArtwork url="https://cdn.example.com/tiny.blob" alt="Cedar" wrapperClassName="frame" />,
    );
    const img = container.querySelector("img")!;
    loadWithSize(img, 1, 1);
    expect(screen.getByText("Artwork unavailable")).toBeInTheDocument();
  });

  it("rejects a zero-dimension decode", () => {
    const { container } = render(
      <AdoptableArtwork url="https://cdn.example.com/zero.webp" alt="Cedar" wrapperClassName="frame" />,
    );
    loadWithSize(container.querySelector("img")!, 0, 0);
    expect(screen.getByText("Artwork unavailable")).toBeInTheDocument();
  });

  it("accepts a genuinely small image that is not a placeholder", () => {
    // A 16x16 favicon-sized avatar is real content and must still display.
    const { container } = render(
      <AdoptableArtwork url="https://cdn.example.com/small.webp" alt="Cedar" wrapperClassName="frame" />,
    );
    loadWithSize(container.querySelector("img")!, 16, 16);
    expect(screen.queryByText("Artwork unavailable")).not.toBeInTheDocument();
  });

  it("shows the unavailable state without a url at all", () => {
    render(<AdoptableArtwork url={null} path={null} alt="Cedar" wrapperClassName="frame" />);
    expect(screen.getByText("Artwork unavailable")).toBeInTheDocument();
  });

  it("labels the state for assistive tech rather than showing a bare block", () => {
    render(<AdoptableArtwork url={null} alt="Cedar" wrapperClassName="frame" fallbackLabel="Artwork unavailable" />);
    const region = screen.getByRole("img");
    expect(region).toHaveAttribute("aria-label", "Cedar — Artwork unavailable");
  });
});
