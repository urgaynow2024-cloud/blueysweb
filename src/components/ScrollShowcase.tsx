"use client";

import Reveal from "@/components/ui/Reveal";

interface ScrollShowcaseProps {
  images: string[];
  title?: string;
}

export default function ScrollShowcase({ images, title }: ScrollShowcaseProps) {
  if (images.length === 0) return null;

  const displayImages = [...images, ...images, ...images];

  return (
    <Reveal>
      <div className="relative w-full overflow-hidden">
        {title && <h3 className="mb-4 text-center text-lg font-bold text-white">{title}</h3>}

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-[var(--bg)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-[var(--bg)]" />

          <div className="animate-marqueeFull flex items-center gap-4">
            <div className="flex items-center gap-4">
              {displayImages.map((img, i) => (
                <ShowcaseCard key={`${i}-${img}`} src={img} index={i} />
              ))}
            </div>
            <div className="flex items-center gap-4">
              {displayImages.map((img, i) => (
                <ShowcaseCard key={`r-${i}-${img}`} src={img} index={i} />
              ))}
            </div>
            <div className="flex items-center gap-4">
              {displayImages.map((img, i) => (
                <ShowcaseCard key={`r2-${i}-${img}`} src={img} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function ShowcaseCard({ src, index }: { src: string; index: number }) {
  return (
    <div className="group relative flex h-[140px] w-[180px] shrink-0 cursor-pointer overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-elevated)] transition-all duration-500 hover:scale-105 hover:border-[var(--border-hover)] hover:shadow-2xl hover:shadow-black/50">
      <img
        src={src}
        alt={`Recent work ${index + 1}`}
        loading="lazy"
        className="h-full w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        Portfolio
      </div>
    </div>
  );
}
