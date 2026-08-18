"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getNsfwPortfolioImages } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { uploadToSupabaseStorage, deleteFromSupabaseStorage } from "@/lib/supabase-storage";
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
    const storagePath = `nsfw/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop() || "bin"}`;
    try {
      const { url, path } = await uploadToSupabaseStorage("portfolio-images", storagePath, file);

      const res = await fetch("/api/nsfw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, path }),
      });
      let result: any;
      try {
        result = await res.json();
      } catch {
        result = {};
      }
      if (res.ok && result.id) return { id: result.id, url, path };
      throw new Error(result.error || result.details || `Upload failed (${res.status})`);
    } catch (err) {
      console.error("NSFW upload error:", err);
      const message = err instanceof Error ? err.message : "Upload failed";
      throw new Error(message);
    }
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
      } catch (err) {
        console.error("NSFW upload error:", err);
        const message = err instanceof Error ? err.message : "Upload failed";
        setImages((prev) => prev.map((img) => (img === temp ? { ...img, uploading: false, error: message } : img)));
        toast.error(message);
      }
    }
  }

  async function deleteImage(index: number) {
    const image = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (image.id) {
      try {
        if (image.path) {
          await deleteFromSupabaseStorage("portfolio-images", image.path);
        }
        await fetch("/api/nsfw", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: image.id, path: image.path }),
        });
      } catch (err) {
        console.error("NSFW delete error:", err);
      }
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
      if (uploaded && old?.id && old.path) {
        await deleteFromSupabaseStorage("portfolio-images", old.path);
      }
      setImages((prev) => prev.map((img, i) => (i === index ? { id: uploaded!.id, url: uploaded!.url, path: uploaded!.path } : img)));
      if (old?.id) {
        await fetch("/api/nsfw", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: old.id, path: old.path }),
        });
      }
      toast.success("NSFW image replaced");
    } catch (err) {
      console.error("NSFW replace error:", err);
      const message = err instanceof Error ? err.message : "Replace failed";
      toast.error(message);
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
    <div className="space-y-6 relative">
      <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-[var(--accent)]/5 blur-[120px] orb-slow" />
      <input ref={fileInputRef} type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={onReplaceFile} />
      <Card className="p-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 h-[200px] w-[200px] rounded-full bg-[var(--accent-2)]/5 blur-[100px] orb-med" />
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
