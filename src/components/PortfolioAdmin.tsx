"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, GripVertical, Save, CheckCircle2 } from "lucide-react";
import { uploadImage, deleteImage, getPortfolioImages, removePortfolioImage, reorderPortfolioImages } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function PortfolioAdmin() {
  const [images, setImages] = useState<{ url: string; id?: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    setError(null);
    try {
      const imgs = await getPortfolioImages();
      const urls = imgs.map((i: any) => ({ url: i.url, id: i.id })).filter((img: any) => img.url);
      setImages(urls);
    } catch (e) {
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const newImages: { url: string; id?: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i], "portfolio");
        if (url) newImages.push({ url });
      }
      if (newImages.length > 0) {
        setImages([...images, ...newImages]);
      }
    } catch (e) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(index: number) {
    const image = images[index];
    if (image.url) {
      await deleteImage(image.url);
    }
    if (image.id) {
      await removePortfolioImage(image.id);
    }
    setImages(images.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: number) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  }

  async function saveChanges() {
    setSaving(true);
    setError(null);
    try {
      const urls = images.map(img => img.url);
      await reorderPortfolioImages(urls);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="glass rounded-2xl p-6 border border-[var(--border)]">
        <p className="text-sm text-[var(--text-secondary)]">Supabase not configured. Add credentials to enable portfolio management.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 md:p-8 border border-[var(--border)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Portfolio Images</h2>
          <p className="text-sm text-[var(--text-secondary)]">Upload images. Each image becomes its own card on your portfolio page.</p>
        </div>
        <button
          onClick={saveChanges}
          disabled={saving || images.length === 0}
          className="btn-primary !text-sm !py-2 !px-4 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            "Saving..."
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

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
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFiles(e.dataTransfer.files);
        }}
        className="mb-6 w-full px-5 py-8 rounded-2xl bg-[var(--bg)] border-2 border-dashed border-[var(--border)] text-center cursor-pointer hover:border-[var(--accent)] hover:text-[var(--text-secondary)] transition-all"
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
          {images.map((image, i) => (
            <div key={i} className="relative group aspect-square">
              <img
                src={image.url}
                alt={`Portfolio ${i + 1}`}
                className="w-full h-full object-cover rounded-xl border border-[var(--border)]"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-1.5">
                <div className="flex gap-1">
                  <button
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="w-8 h-8 grid place-items-center rounded-lg bg-white/20 text-white hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Move up"
                  >
                    <GripVertical className="w-4 h-4 rotate-90" />
                  </button>
                  <button
                    onClick={() => moveImage(i, 1)}
                    disabled={i === images.length - 1}
                    className="w-8 h-8 grid place-items-center rounded-lg bg-white/20 text-white hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Move down"
                  >
                    <GripVertical className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
                <button
                  onClick={() => removeImage(i)}
                  className="w-8 h-8 grid place-items-center rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-2 left-2 w-6 h-6 rounded-md bg-black/60 text-white text-xs flex items-center justify-center font-medium">
                {i + 1}
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
