import { render, screen, fireEvent, act } from "@testing-library/react";
import { AdoptableArtwork } from "@/components/adoptables/AdoptableArtwork";

// next/image is mocked as a plain <img> so the guard's own load handling can be
// driven directly. Every state update is wrapped in act() so React does not
// warn about updates outside a test boundary, and `sizes` is passed so the
// mocked component does not warn about a missing sizes prop.
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, onLoad, onError, fill, sizes, ...rest }: any) => {
    const React = require("react");
    return React.createElement("img", {
      src,
      alt,
      loading: "lazy",
      onLoad,
      onError,
      "data-sizes": sizes,
      ...rest,
    });
  },
}));

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
  act(() => {
    fireEvent.load(img);
  });
}

describe("AdoptableArtwork 1x1 placeholder guard", () => {
  it("renders a real image when the decoded size is normal", () => {
    const { container } = render(
      <AdoptableArtwork url="https://cdn.example.com/art.webp" alt="Cedar" wrapperClassName="frame" sizes="100vw" />,
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
      <AdoptableArtwork url="https://cdn.example.com/tiny.blob" alt="Cedar" wrapperClassName="frame" sizes="100vw" />,
    );
    const img = container.querySelector("img")!;
    loadWithSize(img, 1, 1);
    expect(screen.getByText("Artwork unavailable")).toBeInTheDocument();
  });

  it("rejects a zero-dimension decode", () => {
    const { container } = render(
      <AdoptableArtwork url="https://cdn.example.com/zero.webp" alt="Cedar" wrapperClassName="frame" sizes="100vw" />,
    );
    loadWithSize(container.querySelector("img")!, 0, 0);
    expect(screen.getByText("Artwork unavailable")).toBeInTheDocument();
  });

  it("accepts a genuinely small image that is not a placeholder", () => {
    // A 16x16 favicon-sized avatar is real content and must still display.
    const { container } = render(
      <AdoptableArtwork url="https://cdn.example.com/small.webp" alt="Cedar" wrapperClassName="frame" sizes="100vw" />,
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

  it("shows the adoptable name on the fallback when one is supplied", () => {
    render(
      <AdoptableArtwork
        url={null}
        alt="Thunder"
        wrapperClassName="frame"
        fallbackName="Thunder"
        fallbackDetail="Light Fury"
      />,
    );
    expect(screen.getByText("Thunder")).toBeInTheDocument();
    expect(screen.getByText("Light Fury")).toBeInTheDocument();
  });

  it("aborts a stuck load after the timeout instead of spinning forever", () => {
    jest.useFakeTimers();
    try {
      const { container } = render(
        <AdoptableArtwork
          url="https://cdn.example.com/slow.webp"
          alt="Thunder"
          wrapperClassName="frame"
          fallbackName="Thunder"
          sizes="100vw"
          timeoutMs={5000}
        />,
      );
      // While the image is still loading, a spinner is shown.
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
      expect(screen.queryByText("Thunder")).not.toBeInTheDocument();

      // Advance past the ceiling — the spinner must be replaced by the fallback.
      act(() => {
        jest.advanceTimersByTime(5001);
      });
      expect(screen.getByText("Thunder")).toBeInTheDocument();
      expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it("keeps showing the image when it arrives before the timeout", () => {
    jest.useFakeTimers();
    try {
      const { container } = render(
        <AdoptableArtwork
          url="https://cdn.example.com/arrives.webp"
          alt="Cedar"
          wrapperClassName="frame"
          sizes="100vw"
          timeoutMs={5000}
        />,
      );
      loadWithSize(container.querySelector("img")!, 1200, 1500);
      act(() => {
        jest.advanceTimersByTime(4999);
      });
      expect(screen.queryByText("Artwork unavailable")).not.toBeInTheDocument();
      expect(container.querySelector("img")).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });
});