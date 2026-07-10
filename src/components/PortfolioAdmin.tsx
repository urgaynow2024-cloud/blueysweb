"use client";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { uploadImage, deleteImage, getPortfolioImages, removePortfolioImage, reorderPortfolioImages } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function PortfolioAdmin() {
  const [images, setImages] = useState<string[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    const imgs = await getPortfolioImages();
    const urls = imgs.map((i: any) => i.url).filter(Boolean);
    const imgIds = imgs.map((i: any) => i.id).filter(Boolean);
    setImages(urls);
    setIds(imgIds as string[]);
    setLoading(false);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i], "portfolio");
      if (url) newUrls.push(url);
    }
    setImages([...images, ...newUrls]);
    setUploading(false);
  }

  async function removeImage(index: number) {
    const url = images[index];
    await deleteImage(url);
    await removePortfolioImage(ids[index]);
    setImages(images.filter((_, i) => i !== index));
    setIds(ids.filter((_, i) => i !== index));
  }

  async function moveImage(index: number, direction: number) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const newImages = [...images];
    const newIds = [...ids];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
    setImages(newImages);
    setIds(newIds);
    await reorderPortfolioImages(newImages);
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="glass rounded-2xl p-6 border border-[var(--border)]">
        <p className="text-sm text-[var(--text-secondary)]">Supabase not configured. Add credentials to enable portfolio management.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-7 border border-[var(--border)]">
      <h2 className="text-lg font-semibold text-white mb-2">Portfolio Images</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Upload images. Each image becomes its own card on your portfolio page.</p>

      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        id="portfolio-upload"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        onClick={() => document.getElementById("portfolio-upload")?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="w-full px-5 py-8 rounded-2xl bg-[var(--bg)] border border-dashed border-[var(--border)] text-center cursor-pointer hover:border-[var(--accent)] hover:text-[var(--text-secondary)] transition-all mb-6"
      >
        {uploading ? (
          <p className="text-sm text-[var(--text-secondary)]">Uploading...</p>
        ) : (
          <>
            <Upload className="w-6 h-6 mx-auto mb-2 text-[var(--text-dim)]" />
            <p className="text-sm text-[var(--text-dim)]">Click or drop images to upload</p>
            <p className="text-xs text-[var(--text-dim)] mt-1 opacity-60">Multiple files supported</p>
          </>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-[var(--text-dim)]">Loading...</div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={ids[i] || i} className="relative group aspect-square">
              <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover rounded-xl border border-[var(--border)]" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                <button
                  onClick={() => moveImage(i, -1)}
                  disabled={i === 0}
                  className="px-2 py-1 bg-white/20 text-white text-xs rounded hover:bg-white/30 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveImage(i, 1)}
                  disabled={i === images.length - 1}
                  className="px-2 py-1 bg-white/20 text-white text-xs rounded hover:bg-white/30 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeImage(i)}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--text-dim)] text-sm">
          No images yet. Upload some to get started.
        </div>
      )}
    </div>
  );
}
