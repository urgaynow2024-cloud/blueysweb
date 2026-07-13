"use client";

import { useState } from "react";
import { PortfolioCard, type PortfolioImage } from "./PortfolioCard";
import { SkeletonCard } from "./Skeleton";

export type { PortfolioImage };

interface PortfolioGridProps {
  images: PortfolioImage[];
  loading?: boolean;
  onReorder: (next: PortfolioImage[]) => void;
  onEdit: (index: number) => void;
  onReplace: (index: number) => void;
  onDelete: (index: number) => void;
  onRetry: (index: number) => void;
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function PortfolioGrid({
  images,
  loading = false,
  onReorder,
  onEdit,
  onReplace,
  onDelete,
  onRetry,
}: PortfolioGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDrop(target: number) {
    if (dragIndex === null || dragIndex === target) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    onReorder(move(images, dragIndex, target));
    setDragIndex(null);
    setOverIndex(null);
  }

  if (loading) {
    return (
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="ad-panel ad-empty">
        <p className="text-sm text-[var(--text-secondary)]">No images yet</p>
        <p className="text-xs text-[var(--text-dim)]">Upload your first artwork using the area above.</p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
      {images.map((image, i) => (
        <PortfolioCard
          key={image.id || i}
          image={image}
          index={i}
          total={images.length}
          isDragging={dragIndex === i}
          isOver={overIndex === i}
          onDragStart={setDragIndex}
          onDragEnter={(j) => {
            if (dragIndex !== null && j !== dragIndex) setOverIndex(j);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDrop={handleDrop}
          onEdit={onEdit}
          onReplace={onReplace}
          onDelete={onDelete}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}
