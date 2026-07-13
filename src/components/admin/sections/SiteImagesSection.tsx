"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "../Toast";
import { Card, CardHeader } from "../Card";
import { Button } from "../Button";

const SLOTS = [
  { key: "hero", label: "Homepage — Main Hero", desc: "Large featured image on the left of the hero section. ~1200x800px (16:10).", aspect: "aspect-[16/10]" },
  { key: "avatar_editing", label: "Services — Avatar Editing", desc: "Image beside the Avatar Editing service. ~800x500px (16:10).", aspect: "aspect-[16/10]" },
  { key: "blender_work", label: "Services — Blender Work", desc: "Image beside the Blender Work service. ~800x500px (16:10).", aspect: "aspect-[16/10]" },
  { key: "unity_work", label: "Services — Unity Setup", desc: "Image beside the Unity Setup service. ~800x500px (16:10).", aspect: "aspect-[16/10]" },
];

export function SiteImagesSection() {
  const [images, setImages] = useState<Record<string, { url: string; path?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/site-images");
        if (res.ok) setImages(await res.json());
      } catch {
        toast.error("Failed to load site images");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  async function handleUpload(key: string, file: File) {
    setSaving(key);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);
      const res = await fetch("/api/site-images", { method: "POST", body: formData });
      const result = await res.json();
      if (res.ok && result.url) {
        setImages((prev) => ({ ...prev, [key]: { url: result.url, path: result.path } }));
        toast.success("Image updated");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch {
      toast.error("Network error during upload");
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
        setImages((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        toast.success("Image removed");
      } else {
        toast.error("Failed to remove image");
      }
    } catch {
      toast.error("Network error during removal");
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

  if (!isSupabaseConfigured) {
    return (
      <Card className="p-8">
        <CardHeader title="Site Images" />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">Supabase is not configured. Add credentials to manage site images.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8">
        <CardHeader title="Site Images" />
        <p className="mt-4 text-sm text-[var(--text-dim)]">Loading…</p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <CardHeader title="Site Images" description="Managed images used around the public site. Changes apply immediately." />
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {SLOTS.map((slot) => {
          const image = images[slot.key];
          const isUploading = saving === slot.key;
          return (
            <div key={slot.key} className="ad-panel ad-panel-hover p-5">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white">{slot.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">{slot.desc}</p>
              </div>
              <div className={`relative ${slot.aspect} overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]`}>
                {image ? (
                  <>
                    <img src={image.url} alt={slot.label} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity duration-300 hover:opacity-100">
                      <Button size="sm" variant="secondary" onClick={() => triggerUpload(slot.key)} disabled={isUploading}>
                        {isUploading ? "Uploading…" : "Replace"}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleRemove(slot.key)} disabled={isUploading} leftIcon={<Trash2 className="h-4 w-4" />}>
                        Remove
                      </Button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerUpload(slot.key)}
                    className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]"
                  >
                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" /> : <ImageIcon className="h-8 w-8 opacity-40" />}
                    <span className="text-xs">{isUploading ? "Uploading…" : "Upload an image"}</span>
                  </button>
                )}
              </div>
              {!image && !isUploading && (
                <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => triggerUpload(slot.key)} leftIcon={<Upload className="h-4 w-4" />}>
                  Upload Image
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
