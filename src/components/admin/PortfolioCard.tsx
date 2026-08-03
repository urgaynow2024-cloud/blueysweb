"use client";

import { type DragEvent } from "react";
import { GripVertical, Pencil, RefreshCw, Trash2, ImageOff, Loader2 } from "lucide-react";

export interface PortfolioImage {
  id?: string;
  url: string;
  path?: string;
  uploading?: boolean;
  error?: string;
  retrying?: boolean;
}

interface PortfolioCardProps {
  image: PortfolioImage;
  index: number;
  total: number;
  isDragging: boolean;
  isOver: boolean;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
  onEdit: (index: number) => void;
  onReplace: (index: number) => void;
  onDelete: (index: number) => void;
  onRetry: (index: number) => void;
}

function ActionButton({
  label,
  onClick,
  tone = "default",
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
  children: React.ReactNode;
}) {
  const cls =
    tone === "danger"
      ? "bg-[var(--danger)]/90 text-white hover:bg-[var(--danger)]"
      : "bg-white/15 text-white hover:bg-white/25";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`grid h-9 w-9 place-items-center rounded-lg backdrop-blur-sm transition-colors ${cls}`}
    >
      {children}
    </button>
  );
}

export function PortfolioCard({
  image,
  index,
  total,
  isDragging,
  isOver,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
  onEdit,
  onReplace,
  onDelete,
  onRetry,
}: PortfolioCardProps) {
  return (
    <div
      draggable={!image.uploading && !image.error}
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragOver={(e: DragEvent) => e.preventDefault()}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(index);
      }}
      className={`ad-panel group mb-6 block break-inside-avoid overflow-hidden transition-[opacity,transform,box-shadow] duration-300 ${
        isDragging ? "ad-drag-source" : "ad-panel-hover"
      } ${isDragging ? "ad-drag-active" : ""}`}
    >
      {isOver && !isDragging && <div className="ad-drop-line mx-3 mt-3" />}

      <div className="relative flex min-h-[160px] items-center justify-center bg-[var(--bg-elevated)] p-3">
        {image.uploading ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--accent)]" />
            <p className="text-xs text-[var(--text-dim)]">Uploading…</p>
          </div>
        ) : image.error ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <ImageOff className="h-7 w-7 text-[var(--danger)]" />
            <p className="px-4 text-xs text-[var(--danger)]">{image.error}</p>
            <button
              type="button"
              onClick={() => onRetry(index)}
              disabled={image.retrying}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${image.retrying ? "animate-spin" : ""}`} />
              Retry
            </button>
          </div>
        ) : (
          <img
            src={image.url}
            alt={`Portfolio image ${index + 1}`}
            loading="lazy"
            draggable={false}
            className="mx-auto block h-auto max-w-full object-contain"
          />
        )}

        {!image.uploading && !image.error && (
          <>
            <span className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-lg bg-black/60 text-xs font-semibold text-white backdrop-blur-sm">
              {index + 1}
            </span>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
              <div className="flex gap-2">
                <ActionButton label="Edit" onClick={() => onEdit(index)}>
                  <Pencil className="h-4 w-4" />
                </ActionButton>
                <ActionButton label="Replace" onClick={() => onReplace(index)}>
                  <RefreshCw className="h-4 w-4" />
                </ActionButton>
                <ActionButton label="Delete" tone="danger" onClick={() => onDelete(index)}>
                  <Trash2 className="h-4 w-4" />
                </ActionButton>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="truncate text-sm font-medium text-[var(--text-secondary)]">
          {image.uploading ? "Uploading…" : image.error ? "Upload failed" : `Image ${index + 1}`}
          <span className="ml-1.5 text-[var(--text-dim)]">/ {total}</span>
        </span>
        {!image.uploading && !image.error && (
          <span
            className="flex shrink-0 cursor-grab items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[var(--text-dim)] transition-colors group-hover:text-[var(--text-secondary)] active:cursor-grabbing"
            aria-hidden
          >
            <GripVertical className="h-4 w-4" />
            Drag
          </span>
        )}
      </div>
    </div>
  );
}
