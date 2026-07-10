"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

interface Props {
  value?: string[];
  onChange: (urls: string[]) => void;
  bucketPath?: string;
  maxFiles?: number;
}

export default function GalleryUpload({ value = [], onChange, bucketPath = "portfolio-images", maxFiles = 8 }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (let i = 0; i < Math.min(files.length, maxFiles - value.length); i++) {
      const url = await uploadImage(files[i], bucketPath);
      if (url) newUrls.push(url);
    }
    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="w-full px-4 py-6 rounded-2xl bg-[var(--bg)] border border-dashed border-[var(--border)] text-center text-[var(--text-dim)] text-sm">
        <p className="mb-1">Supabase not configured</p>
        <p className="text-xs">Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable uploads</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover rounded-xl border border-[var(--border)]" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="w-8 h-8 grid place-items-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {value.length < maxFiles && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className="w-full px-5 py-6 rounded-2xl bg-[var(--bg)] border border-dashed border-[var(--border)] text-center cursor-pointer hover:border-[var(--accent)] hover:text-[var(--text-secondary)] transition-all"
        >
          {uploading ? (
            <p className="text-sm text-[var(--text-secondary)]">Uploading...</p>
          ) : (
            <>
              <Upload className="w-5 h-5 mx-auto mb-1.5 text-[var(--text-dim)]" />
              <p className="text-xs text-[var(--text-dim)]">Click or drop images here ({value.length}/{maxFiles})</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
