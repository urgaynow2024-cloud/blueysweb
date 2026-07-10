"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
  bucketPath?: string;
}

export default function ImageUpload({ value, onChange, bucketPath = "general" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file, bucketPath);
      if (url) {
        setPreview(url);
        onChange(url);
      }
    } catch (e) {
      console.error("Upload failed:", e);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const removeImage = async () => {
    setPreview(null);
    onChange(null);
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
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {preview ? (
        <div className="relative group">
          <img src={preview} alt="Upload preview" className="w-full h-48 object-cover rounded-xl border border-[var(--border)]" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="w-full px-5 py-8 rounded-2xl bg-[var(--bg)] border border-dashed border-[var(--border)] text-center cursor-pointer hover:border-[var(--accent)] hover:text-[var(--text-secondary)] transition-all"
        >
          {uploading ? (
            <p className="text-sm text-[var(--text-secondary)]">Uploading...</p>
          ) : (
            <>
              <Upload className="w-6 h-6 mx-auto mb-2 text-[var(--text-dim)]" />
              <p className="text-sm text-[var(--text-dim)]">Drop an image here or click to upload</p>
            </>
          )}
        </div>
      )}
      {preview && (
        <p className="text-xs text-[var(--text-dim)] break-all">Image URL: {preview}</p>
      )}
    </div>
  );
}
