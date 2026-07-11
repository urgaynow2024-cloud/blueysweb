"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";

const SLOTS = [
  { key: "hero", label: "Homepage — Main Hero Image", desc: "Large featured image on the left side of the homepage hero section. Recommended: 1200x800px, 16:10 aspect ratio.", aspect: "aspect-[16/10]" },
  { key: "avatar_editing", label: "Services — Avatar Editing", desc: "Image shown beside the Avatar Editing service description on the homepage. Recommended: 800x500px, 16:10 aspect ratio.", aspect: "aspect-[16/10]" },
  { key: "blender_work", label: "Services — Blender Work", desc: "Image shown beside the Blender Work service description on the homepage. Recommended: 800x500px, 16:10 aspect ratio.", aspect: "aspect-[16/10]" },
  { key: "unity_work", label: "Services — Unity Setup", desc: "Image shown beside the Unity Setup service description on the homepage. Recommended: 800x500px, 16:10 aspect ratio.", aspect: "aspect-[16/10]" },
];

export default function SiteImagesAdmin() {
  const [images, setImages] = useState<Record<string, { url: string; path?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/site-images");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (e) {
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(key: string, file: File) {
    setSaving(key);
    setError(null);
    setSaved(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);

      const res = await fetch("/api/site-images", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.url) {
        setImages(prev => ({ ...prev, [key]: { url: result.url, path: result.path } }));
        setSaved("Image updated — changes appear immediately on the public site.");
        setTimeout(() => setSaved(null), 3000);
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (e) {
      setError("Network error during upload");
    } finally {
      setSaving(null);
    }
  }

  async function handleRemove(key: string) {
    const image = images[key];
    if (!image) return;

    try {
      const res = await fetch("/api/site-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, path: image.path }),
      });

      if (res.ok) {
        setImages(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      } else {
        setError("Failed to remove image");
      }
    } catch (e) {
      setError("Network error during removal");
    }
  }

  function triggerUpload(key: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(key, file);
    };
    input.click();
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-[var(--text-dim)]">Loading images...</div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          {error}
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">&times;</button>
        </div>
      )}

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {saved}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SLOTS.map((slot) => {
          const image = images[slot.key];
          const isUploading = saving === slot.key;

          return (
            <div key={slot.key} className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">{slot.label}</h3>
                  <p className="text-xs text-[var(--text-dim)] mt-1 leading-relaxed">{slot.desc}</p>
                </div>
              </div>

              <div className={`relative ${slot.aspect} rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] mb-3 group`}>
                {image ? (
                  <>
                    <img src={image.url} alt={slot.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => triggerUpload(slot.key)}
                        disabled={isUploading}
                        className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        {isUploading ? "Uploading..." : "Replace"}
                      </button>
                      <button
                        onClick={() => handleRemove(slot.key)}
                        disabled={isUploading}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-dim)]">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
                        <p className="text-xs">Uploading...</p>
                      </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-xs">Upload an image</p>
                    </>
                  )}
                  </div>
                )}
              </div>

              {!image && !isUploading && (
                <button
                  onClick={() => triggerUpload(slot.key)}
                  className="w-full py-2 rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--text-secondary)] transition-all"
                >
                  Upload Image
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
