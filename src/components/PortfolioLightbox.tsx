"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxItem {
  url: string;
  caption?: string;
  title?: string;
  description?: string;
}

interface LightboxProps {
  images: LightboxItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const current = images[index];

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [handleKey]);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [swipeActive, setSwipeActive] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwipeActive(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeActive) return;
    setSwipeActive(false);
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) onNext();
      else onPrev();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.06] blur-[100px]" />
        <div className="absolute -bottom-20 right-1/4 h-[250px] w-[250px] translate-x-1/2 rounded-full bg-[var(--accent-nebula)] opacity-[0.05] blur-[100px]" />
      </div>
      <div className="relative flex max-h-[95vh] max-w-[95vw] scale-in flex-col items-center justify-center">
        <img
          src={current.url}
          alt={current.caption || current.title || `Portfolio ${index + 1}`}
          className="max-h-[80vh] max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl shadow-black/60"
          onError={(e) => {
            e.currentTarget.src = "https://picsum.photos/id/1000/800/600";
            e.currentTarget.alt = "Image failed to load - placeholder shown";
          }}
        />

        {current.caption && (
          <div className="mt-4 max-w-xl text-center">
            {current.title && <p className="text-sm font-semibold text-white mb-1">{current.title}</p>}
            <p className="text-xs text-white/60 leading-relaxed">{current.caption}</p>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:left-5"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:right-5"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="absolute -top-2 right-0 grid h-10 w-10 translate-x-2 -translate-y-2 place-items-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:-top-3 md:right-2"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          {index + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
