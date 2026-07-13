interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className = "", rounded = "rounded-[var(--r-sm)]" }: SkeletonProps) {
  return <div className={`ad-skeleton ${rounded} ${className}`} aria-hidden />;
}

/** A card-shaped placeholder used while portfolio / sections load. */
export function SkeletonCard() {
  return (
    <div className="ad-panel overflow-hidden p-0">
      <Skeleton rounded="rounded-none" className="aspect-[4/3] w-full" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
