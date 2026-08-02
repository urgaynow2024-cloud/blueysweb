"use client";

import { useState, useRef, useEffect } from "react";
import Reveal from "@/components/ui/Reveal";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  category?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  title,
  category,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const draggingRef = useRef(false);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.max(0, Math.min(100, x)));
    }

    function handleTouchMove(e: TouchEvent) {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      if (!touch) return;
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.max(0, Math.min(100, x)));
      e.preventDefault();
    }

    function stopDragging() {
      draggingRef.current = false;
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopDragging);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", stopDragging);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopDragging);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", stopDragging);
    };
  }, []);

  function startDrag(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    draggingRef.current = true;
  }

  return (
    <Reveal>
      <div className="group relative">
        {(title || category) && (
          <div className="mb-3 flex items-center justify-between">
            {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
            {category && <span className="text-xs font-medium text-[var(--accent)]">{category}</span>}
          </div>
        )}
        <div
          ref={containerRef}
          className="relative aspect-[4/3] cursor-col-resize overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] touch-none select-none"
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <div className="absolute inset-0 flex">
            <div
              className="relative h-full overflow-hidden border-r border-[var(--border-hover)]"
              style={{ width: `${sliderPos}%`, minWidth: "20px" }}
            >
              <img
                src={beforeImage}
                alt="Before"
                className="h-full w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent">
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-white">{beforeLabel}</span>
              </div>
            </div>
            <div className="relative h-full flex-1 overflow-hidden">
              <img
                src={afterImage}
                alt="After"
                className="h-full w-full object-cover"
                style={{ transform: "translateX(-100%)" }}
                draggable={false}
              />
              <img
                src={afterImage}
                alt="After (visible)"
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent">
                <span className="absolute bottom-3 right-3 text-xs font-semibold text-white">{afterLabel}</span>
              </div>
            </div>
          </div>

          <div
            className="absolute top-0 h-full w-1.5 cursor-col-resize touch-none"
            style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
          >
            <div className="relative h-full w-full">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--accent)] opacity-50" />
              <div className="absolute left-1/2 top-1/2 grid h-8 w-8 place-items-center -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--accent)] bg-[var(--bg-float)] text-[var(--accent)] shadow-lg shadow-black/50 backdrop-blur">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M9 18c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1h-1c-.55 0-1 .45-1 1v12H9zm7.94-9.04c.04.34.06.68.06 1.04 0 1.71-1.39 3.1-3.1 3.1S9.8 12.79 9.8 11.08 11.19 7.98 13 6.9c.34-.02.66.03 1 .12A5.47 5.47 0 0 1 18.69 9.5c-.02.34-.08.68-.15 1.01.05-.01.11-.02.17-.04z" />
                </svg>
              </div>
              <div className="absolute inset-0 -z-10 rounded-full bg-[var(--accent)] opacity-20 blur-xl" />
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-[var(--text-dim)] opacity-0 transition-opacity group-hover:opacity-100"
        >
          Drag to compare
        </div>
      </div>
    </Reveal>
  );
}
