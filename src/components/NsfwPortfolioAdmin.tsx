"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, GripVertical, Save, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { getNsfwPortfolioImages, removeNsfwPortfolioImage, reorderNsfwPortfolioImages } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

interface ImageItem {
  url: string;
  id?: string;
  path?: string;
  uploading?: boolean;
  error?: string;
  retrying?: boolean;
}

export default function NsfwPortfolioAdmin() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    setError(null);
    try {
      const imgs = await getNsfwPortfolioImages();
      const urls = imgs.map((i: any) => ({ url: i.url, id: i.id, path: i.path })).filter((img: any) => img.url);
      setImages(urls);
    } catch (e) {
      console.error("Failed to load NSFW images:", e);
      setError("Failed to load NSFW images. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    setSuccess(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/nsfw/upload", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();

        if (res.ok && result.id) {
          setImages(prev => [...prev, { url: result.url, id: result.id, path: result.path }]);
          setSuccess("NSFW image uploaded successfully");
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(result.error || "Upload failed");
        }
      } catch (e) {
        setError("Network error during upload");
      }
    }

    setUploading(false);
  }

  async function removeImage(index: number) {
    const image = images[index];
    setImages(images.filter((_, i) => i !== index));

    if (image.id) {
      try {
        const res = await fetch("/api/nsfw", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: image.id, path: image.path }),
        });
        if (!res.ok) {
          console.error("NSFW delete failed");
        }
      } catch (e) {
        console.error("NSFW delete error:", e);
      }
    }
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
    setSuccess(null);
    try {
      const items = images
        .filter(img => img.id)
        .map((img, idx) => ({ id: img.id!, sort_order: idx }));

      if (items.length > 0) {
        const res = await fetch("/api/nsfw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(items),
        });

        if (!res.ok) {
          const result = await res.json();
          throw new Error(result.error || "Save failed");
        }
      }

      setSaved(true);
      setSuccess("NSFW image order saved successfully");
      setTimeout(() => {
        setSaved(false);
        setSuccess(null);
      }, 3000);
    } catch (e: any) {
      setError(e.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="glass rounded-2xl p-6 border border-[var(--border)]">
        <p className="text-sm text-[var(--text-secondary)]">Supabase not configured. Add credentials to enable NSFW portfolio management.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 md:p-8 border border-[var(--border)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">NSFW Portfolio Images</h2>
          <p className="text-sm text-[var(--text-secondary)]">Manage adult content portfolio. Only visible to verified 18+ users.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadImages}
            className="!text-sm !py-2 !px-3 btn-secondary inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reload
          </button>
          <button
            onClick={saveChanges}
            disabled={saving || images.length === 0 || uploading}
            className="btn-primary !text-sm !py-2 !px-4 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-[var(--text-dim)] mb-4">
        {images.length} image{images.length !== 1 ? 's' : ''} loaded
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <strong>Error loading images.</strong> Make sure you have run the updated Supabase schema (`supabase/schema.sql`). If the table doesn't exist, create it in the Supabase SQL Editor.
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        id="nsfw-upload"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        onClick={() => !uploading && document.getElementById("nsfw-upload")?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFiles(e.dataTransfer.files);
        }}
        className={`mb-6 w-full px-5 py-8 rounded-2xl bg-[var(--bg)] border-2 border-dashed border-[var(--border)] text-center cursor-pointer hover:border-[var(--accent)] hover:text-[var(--text-secondary)] transition-all ${uploading ? "opacity-50 cursor-wait" : ""}`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
            <p className="text-sm text-[var(--text-secondary)]">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 mx-auto mb-2 text-[var(--text-dim)]" />
            <p className="text-sm text-[var(--text-dim)]">Click or drop NSFW images to upload</p>
            <p className="text-xs text-[var(--text-dim)] mt-1 opacity-60">Supports JPG, PNG, WebP</p>
          </>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-[var(--text-dim)]">Loading...</div>
      ) : images.length > 0 ? (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
          {images.map((image, i) => {
            let cardContent = null;

            if (image.uploading) {
              cardContent = (
                <div className="w-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)] mx-auto mb-2" />
                    <p className="text-xs text-[var(--text-dim)]">Uploading...</p>
                  </div>
                </div>
              );
            } else if (image.error) {
              cardContent = (
                <div className="w-full flex flex-col items-center justify-center p-4">
                  <p className="text-xs text-red-400 text-center mb-2">{image.error}</p>
                </div>
              );
            } else {
              cardContent = (
                <div className="relative">
                  <img
                    src={image.url}
                    alt={`NSFW Portfolio ${i + 1}`}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex flex-col items-center justify-center gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveImage(i, -1)}
                        disabled={i === 0}
                        className="w-9 h-9 grid place-items-center rounded-lg bg-white/15 text-white hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                        title="Move up"
                      >
                        <GripVertical className="w-4 h-4 rotate-90" />
                      </button>
                      <button
                        onClick={() => moveImage(i, 1)}
                        disabled={i === images.length - 1}
                        className="w-9 h-9 grid place-items-center rounded-lg bg-white/15 text-white hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                        title="Move down"
                      >
                        <GripVertical className="w-4 h-4 -rotate-90" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeImage(i)}
                      className="w-9 h-9 grid place-items-center rounded-lg bg-red-500/90 text-white hover:bg-red-600 transition-all backdrop-blur-sm"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-black/60 text-white text-xs flex items-center justify-center font-semibold backdrop-blur-sm">
                    {i + 1}
                  </div>
                </div>
              );
            }

            return (
              <div key={image.id || i} className="relative group rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] transition-all duration-300 hover:border-[var(--border-hover)]">
                {cardContent}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
