"use client";

import { useState, useRef } from "react";
import { Upload, X, Trash2 } from "lucide-react";
import { uploadImage, deleteImage, getGalleryImages } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function GalleryBulkUpload() {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useState(() => {
    loadImages();
  });

  async function loadImages() {
    setLoading(true);
    const imgs = await getGalleryImages();
    const urls = imgs.map((i: any) => i.url).filter(Boolean);
    setImages(urls);
    setLoading(false);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i], "gallery");
      if (url) setImages(prev => [...prev, url]);
    }
    setUploading(false);
  }

  async function removeImage(url: string) {
    await deleteImage(url);
    setImages(prev => prev.filter(img => img !== url));
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="w-full px-4 py-6 rounded-2xl bg-[var(--bg)] border border-dashed border-[var(--border)] text-center text-[var(--text-dim)] text-sm">
        <p className="mb-1">Supabase not configured</p>
        <p className="text-xs">Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover rounded-xl border border-[var(--border)]" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 w-7 h-7 grid place-items-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className="w-full px-5 py-8 rounded-2xl bg-[var(--bg)] border border-dashed border-[var(--border)] text-center cursor-pointer hover:border-[var(--accent)] hover:text-[var(--text-secondary)] transition-all"
      >
        {uploading ? (
          <p className="text-sm text-[var(--text-secondary)]">Uploading...</p>
        ) : (
          <>
            <Upload className="w-6 h-6 mx-auto mb-2 text-[var(--text-dim)]" />
            <p className="text-sm text-[var(--text-dim)]">Drop photos here or click to upload</p>
            <p className="text-xs text-[var(--text-dim)] mt-1 opacity-60">No naming needed, just drag and drop</p>
          </>
        )}
      </div>
    </div>
  );
}
