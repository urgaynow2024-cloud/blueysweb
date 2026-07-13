"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, GripVertical, Save, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { getPortfolioImages } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

interface ImageItem {
  url: string;
  id?: string;
  path?: string;
  uploading?: boolean;
  error?: string;
  retrying?: boolean;
}

export default function PortfolioAdmin() {
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
    setSuccess(null);

    const newImages: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const item: ImageItem = { url: "", uploading: true };
      newImages.push(item);

      setImages(prev => [...prev, item]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "portfolio");

        const res = await fetch("/api/portfolio/upload", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();

        if (res.ok && result.id) {
          setImages(prev => prev.map(img => img === item ? { url: result.url, id: result.id, path: result.path, uploading: false } : img));
          setSuccess("Image uploaded successfully");
          setTimeout(() => setSuccess(null), 3000);
        } else {
          const errorMsg = result.error || "Upload failed";
          setImages(prev => prev.map(img => img === item ? { ...img, uploading: false, error: errorMsg } : img));
          setError(`Failed to upload ${file.name}: ${errorMsg}`);
        }
      } catch (e) {
        setImages(prev => prev.map(img => img === item ? { ...img, uploading: false, error: "Network error" } : img));
        setError(`Network error uploading ${file.name}`);
      }
    }

    setUploading(false);
  }

  async function retryUpload(index: number) {
    const image = images[index];
    if (!image.error) return;

    setImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], retrying: true, error: undefined };
      return updated;
    });

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) {
        setImages(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], retrying: false };
          return updated;
        });
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "portfolio");

        const res = await fetch("/api/portfolio/upload", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();

        if (res.ok && result.id) {
          setImages(prev => prev.map((img, i) => i === index ? { url: result.url, id: result.id, path: result.path, uploading: false, retrying: false } : img));
          setSuccess("Retry successful");
          setTimeout(() => setSuccess(null), 3000);
        } else {
          const errorMsg = result.error || "Retry failed";
          setImages(prev => prev.map((img, i) => i === index ? { ...img, retrying: false, error: errorMsg } : img));
          setError(`Retry failed: ${errorMsg}`);
        }
      } catch (e) {
        setImages(prev => prev.map((img, i) => i === index ? { ...img, retrying: false, error: "Network error" } : img));
      }
    };
    input.click();
  }

  async function removeImage(index: number) {
    const image = images[index];
    setImages(images.filter((_, i) => i !== index));

    if (image.id) {
      try {
        const res = await fetch("/api/portfolio", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: image.id, path: image.path }),
        });
        if (!res.ok) {
          console.error("Delete failed");
        }
      } catch (e) {
        console.error("Delete error:", e);
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
        const res = await fetch("/api/portfolio/reorder", {
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
      setSuccess("Image order saved successfully");
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
          disabled={saving || images.length === 0 || uploading}
          className="btn-primary !text-sm !py-2.5 !px-5 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">&times;</button>
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
        id="portfolio-upload"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        onClick={() => !uploading && document.getElementById("portfolio-upload")?.click()}
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
            <p className="text-sm text-[var(--text-dim)]">Click or drop images to upload</p>
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
                  <button
                    onClick={() => retryUpload(i)}
                    disabled={image.retrying}
                    className="flex items-center gap-1 text-xs text-[var(--accent)] hover:text-white transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${image.retrying ? "animate-spin" : ""}`} />
                    Retry
                  </button>
                </div>
              );
            } else {
              cardContent = (
                <div className="relative">
                  <img
                    src={image.url}
                    alt={`Portfolio ${i + 1}`}
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
