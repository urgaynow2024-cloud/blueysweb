"use client";

import { useRef, useState, type DragEvent } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

interface UploadAreaProps {
  onFiles: (files: FileList | null) => void;
  uploading?: boolean;
  disabled?: boolean;
  title?: string;
  formats?: string[];
  inputId?: string;
}

export function UploadArea({
  onFiles,
  uploading = false,
  disabled = false,
  title = "Upload Images",
  formats = ["PNG", "JPG", "WEBP"],
  inputId = "admin-upload",
}: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled || uploading) return;
    onFiles(e.dataTransfer.files);
  }

  return (
    <div
      role="button"
      tabIndex={disabled || uploading ? -1 : 0}
      aria-label={`${title}. Drag and drop or browse files.`}
      aria-disabled={disabled || uploading}
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled && !uploading) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !uploading) setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
      }}
      onDrop={handleDrop}
      className={`ad-upload ${dragging ? "ad-upload-drag" : ""} ${disabled || uploading ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-[var(--accent)]">
        {uploading ? <Loader2 className="h-7 w-7 animate-spin" /> : <UploadCloud className="h-7 w-7" />}
      </div>

      <div>
        <p className="text-base font-semibold text-white">{uploading ? "Uploading…" : title}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Drag &amp; Drop</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {formats.map((f) => (
          <span key={f} className="ad-badge border-[var(--border-strong)] text-[var(--text-secondary)]">
            {f}
          </span>
        ))}
      </div>

      <span
        className={`ad-btn ad-btn-secondary ad-btn-sm ${disabled || uploading ? "pointer-events-none opacity-50" : ""}`}
        role="presentation"
      >
        {uploading ? "Please wait…" : "Browse Files"}
      </span>
    </div>
  );
}
