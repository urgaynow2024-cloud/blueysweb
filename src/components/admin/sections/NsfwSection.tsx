"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getNsfwPortfolioImages } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useSave } from "../SaveProvider";
import { useToast } from "../Toast";
import { Card, CardHeader } from "../Card";
import { UploadArea } from "../UploadArea";
import { PortfolioGrid, type PortfolioImage } from "../PortfolioGrid";

export function NsfwSection() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const imagesRef = useRef<PortfolioImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  const { markDirty, register } = useSave();
  const toast = useToast();

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const imgs = await getNsfwPortfolioImages();
        setImages(imgs.map((i: any) => ({ id: i.id, url: i.url, path: i.path })).filter((x: any) => x.url));
      } catch {
        toast.error("Failed to load NSFW images");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const saveNsfw = useCallback(async () => {
    const items = imagesRef.current
      .filter((img) => img.id)
      .map((img, idx) => ({ id: img.id!, sort_order: idx }));
    if (items.length === 0) return;
    const res = await fetch("/api/nsfw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
    if (!res.ok) {
      const r = await res.json().catch(() => ({}));
      throw new Error(r.error || "Failed to save NSFW order");
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    return register("nsfw", saveNsfw);
  }, [register, saveNsfw]);

  async function uploadOne(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/nsfw/upload", { method: "POST", body: formData });
    const result = await res.json();
    if (res.ok && result.id) return { id: result.id, url: result.url, path: result.path };
    throw new Error(result.error || "Upload failed");
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const temp: PortfolioImage = { url: "", uploading: true };
      setImages((prev) => [...prev, temp]);
      try {
        const uploaded = await uploadOne(file);
        setImages((prev) => prev.map((img) => (img === temp ? { id: uploaded!.id, url: uploaded!.url, path: uploaded!.path } : img)));
        toast.success("NSFW image uploaded");
      } catch {
        setImages((prev) => prev.map((img) => (img === temp ? { ...img, uploading: false, error: "Upload failed" } : img)));
        toast.error("Failed to upload NSFW image");
      }
    }
  }

  async function deleteImage(index: number) {
    const image = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (image.id) {
      try {
        await fetch("/api/nsfw", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: image.id, path: image.path }),
        });
      } catch {}
    }
  }

  function replaceImage(index: number) {
    replaceIndexRef.current = index;
    fileInputRef.current?.click();
  }

  async function onReplaceFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const index = replaceIndexRef.current;
    replaceIndexRef.current = null;
    if (!file || index === null) return;
    const old = images[index];
    try {
      const uploaded = await uploadOne(file);
      setImages((prev) => prev.map((img, i) => (i === index ? { id: uploaded!.id, url: uploaded!.url, path: uploaded!.path } : img)));
      if (old?.id) {
        await fetch("/api/nsfw", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: old.id, path: old.path }),
        });
      }
      toast.success("NSFW image replaced");
    } catch {
      toast.error("Failed to replace NSFW image");
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <Card className="p-8">
        <CardHeader title="NSFW Portfolio" />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">Supabase is not configured. Add credentials to manage NSFW content.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onReplaceFile} />
      <Card className="p-8">
        <CardHeader
          title="NSFW Portfolio"
          description="Age-gated adult content. Visible only to verified 18+ visitors. Drag to reorder."
        />
        <div className="mt-6">
          <UploadArea onFiles={handleFiles} uploading={images.some((i) => i.uploading)} title="Upload NSFW Images" />
        </div>
      </Card>
      <PortfolioGrid
        images={images}
        loading={loading}
        onReorder={(next) => {
          setImages(next);
          markDirty();
        }}
        onEdit={() => {}}
        onReplace={replaceImage}
        onDelete={deleteImage}
        onRetry={() => {}}
      />
    </div>
  );
}
