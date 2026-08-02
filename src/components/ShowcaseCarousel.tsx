"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  beforeImage?: string;
  afterImage?: string;
}

interface ShowcaseCarouselProps {
  projects: Project[];
}

export default function ShowcaseCarousel({ projects }: ShowcaseCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 768) setVisibleCount(1);
      else if (w < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, projects.length - visibleCount);

  function next() {
    setCurrent((c) => Math.min(c + 1, maxIndex));
  }
  function prev() {
    setCurrent((c) => Math.max(c - 1, 0));
  }

  if (projects.length === 0) return null;

  return (
    <Reveal>
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <h3 className="heading-md text-white">Featured Projects</h3>
          {projects.length > visibleCount && (
            <div className="flex gap-2">
              <button
                onClick={prev}
                disabled={current === 0}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-white transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                disabled={current >= maxIndex}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-white transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={containerRef}
          className="mt-8 flex items-center gap-6 overflow-hidden"
        >
          <div
            className="flex items-stretch gap-6 transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(-${(current / Math.max(1, maxIndex)) * 100}%)`,
              width: `${projects.length * (100 / visibleCount)}%`,
            }}
          >
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/portfolio`}
                className="group relative flex-shrink-0 cursor-pointer"
                style={{ width: `${100 / projects.length}%` }}
              >
                <div className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] shadow-lg shadow-black/40 transition-all duration-500 group-hover:scale-[1.03] group-hover:border-[var(--border-hover)] group-hover:shadow-2xl">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-60" />
                    <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {p.category}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <h4 className="text-lg font-bold">{p.title}</h4>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {projects.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {projects.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(Math.min(i, maxIndex))}
                className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30"
                    : "bg-[var(--border)] hover:bg-[var(--border-hover)]"
                }`}
                aria-label={`Go to project ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/portfolio"
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            View Full Portfolio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
