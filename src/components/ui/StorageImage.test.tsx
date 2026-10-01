import { render, screen, fireEvent } from "@testing-library/react";

// next/image is mocked as a plain <img> so the guard's own load handling can be
// driven directly. The mocked component mirrors next/image's real behaviour of
// swapping in a 1x1 transparent GIF placeholder before the true source.
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, onLoad, onError, fill, ...rest }: any) => {
    const React = require("react");
    return React.createElement("img", {
      src,
      alt,
      loading: "lazy",
      onLoad,
      onError,
      ...rest,
    });
  },
}));

import { StorageImage } from "@/components/ui/StorageImage";

const REAL = "https://cdn.example.com/portfolio/1783734379052-a0q7ighex8.png";
const BLUR = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function fireLoad(
  img: HTMLElement,
  { currentSrc, w, h }: { currentSrc: string; w: number; h: number },
) {
  Object.defineProperty(img, "currentSrc", { value: currentSrc, configurable: true });
  Object.defineProperty(img, "naturalWidth", { value: w, configurable: true });
  Object.defineProperty(img, "naturalHeight", { value: h, configurable: true });
  fireEvent.load(img);
}

describe("StorageImage", () => {
  it("shows a real image", () => {
    const { container } = render(<StorageImage src={REAL} alt="Artwork" fill />);
    fireLoad(container.querySelector("img")!, { currentSrc: REAL, w: 1786, h: 1837 });
    expect(screen.queryByText("Image unavailable")).not.toBeInTheDocument();
  });

  it("ignores the 1x1 placeholder GIF next/image shows before the real source", () => {
    // Regression: lazy `fill` images render a 1x1 transparent GIF first. That
    // placeholder fires a load event, and measuring it made a genuine
    // 1786x1837 photo render as "Image unavailable".
    const { container } = render(<StorageImage src={REAL} alt="Artwork" fill />);
    const img = container.querySelector("img")!;
    fireLoad(img, { currentSrc: BLUR, w: 1, h: 1 });
    expect(screen.queryByText("Image unavailable")).not.toBeInTheDocument();

    // The real image then loads and displays normally.
    fireLoad(img, { currentSrc: REAL, w: 1786, h: 1837 });
    expect(screen.queryByText("Image unavailable")).not.toBeInTheDocument();
    expect(container.querySelector("img")).toBeInTheDocument();
  });

  it("still rejects a genuine 1x1 upload over http", () => {
    // The real corruption: a 94-byte 1x1 WebP served from the bucket. Its src is
    // not a data URI, so it must still be caught.
    const url = "https://cdn.example.com/portfolio/tiny.blob";
    const { container } = render(<StorageImage src={url} alt="Artwork" fill />);
    fireLoad(container.querySelector("img")!, { currentSrc: url, w: 1, h: 1 });
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
  });

  it("shows the unavailable state on a network error", () => {
    const { container } = render(<StorageImage src={REAL} alt="Artwork" fill />);
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
  });

  it("honours a custom label", () => {
    const url = "https://cdn.example.com/tiny.blob";
    const { container } = render(<StorageImage src={url} alt="Bluey" unavailableLabel="No avatar" />);
    fireLoad(container.querySelector("img")!, { currentSrc: url, w: 1, h: 1 });
    expect(screen.getByText("No avatar")).toBeInTheDocument();
    expect(screen.queryByText("Image unavailable")).not.toBeInTheDocument();
  });

  it("labels the state for assistive tech", () => {
    const url = "https://cdn.example.com/tiny.blob";
    const { container } = render(<StorageImage src={url} alt="Bluey" unavailableLabel="No avatar" />);
    fireLoad(container.querySelector("img")!, { currentSrc: url, w: 1, h: 1 });
    const region = screen.getByRole("img");
    expect(region).toHaveAttribute("aria-label", expect.stringContaining("No avatar"));
  });
});
