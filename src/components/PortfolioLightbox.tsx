"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[95vh] max-w-[95vw] scale-in items-center justify-center">
        <img
          src={images[index]}
          alt={`Portfolio ${index + 1}`}
          className="max-h-[88vh] max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl shadow-black/60"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:left-5"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:right-5"
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
