"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getPortfolioImages } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useSave } from "../SaveProvider";
import { useToast } from "../Toast";
import { Card, CardHeader } from "../Card";
import { UploadArea } from "../UploadArea";
import { PortfolioGrid, type PortfolioImage } from "../PortfolioGrid";
import { Modal } from "../Modal";
import { Button } from "../Button";

export function PortfolioSection() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState<number | null>(null);
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
        const imgs = await getPortfolioImages();
        setImages(imgs.map((i: any) => ({ id: i.id, url: i.url, path: i.path })).filter((x: any) => x.url));
      } catch {
        toast.error("Failed to load portfolio images");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const savePortfolio = useCallback(async () => {
    const items = imagesRef.current
      .filter((img) => img.id)
      .map((img, idx) => ({ id: img.id!, sort_order: idx }));
    if (items.length === 0) return;
    const res = await fetch("/api/portfolio/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
    if (!res.ok) {
      const r = await res.json().catch(() => ({}));
      throw new Error(r.error || "Failed to save portfolio order");
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    return register("portfolio", savePortfolio);
  }, [register, savePortfolio]);

  async function uploadOne(file: File): Promise<{ id: string; url: string; path: string } | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "portfolio");
    const res = await fetch("/api/portfolio/upload", { method: "POST", body: formData });
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
        toast.success("Image uploaded");
      } catch (e: any) {
        setImages((prev) => prev.map((img) => (img === temp ? { ...img, uploading: false, error: e.message || "Upload failed" } : img)));
        toast.error("Failed to upload image");
      }
    }
  }

  async function retryUpload(index: number) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImages((prev) => prev.map((img, i) => (i === index ? { ...img, uploading: true, error: undefined, retrying: true } : img)));
      try {
        const uploaded = await uploadOne(file);
        setImages((prev) => prev.map((img, i) => (i === index ? { id: uploaded!.id, url: uploaded!.url, path: uploaded!.path, uploading: false, retrying: false, error: undefined } : img)));
        toast.success("Image uploaded");
      } catch {
        setImages((prev) => prev.map((img, i) => (i === index ? { ...img, uploading: false, retrying: false, error: "Upload failed" } : img)));
        toast.error("Failed to upload image");
      }
    };
    input.click();
  }

  async function deleteImage(index: number) {
    const image = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (image.id) {
      try {
        await fetch("/api/portfolio", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: image.id, path: image.path }),
        });
      } catch {
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
      setImages((prev) => prev.map((img, i) => (i === index ? { id: uploaded!.id, url: uploaded!.url, path: uploaded!.path } : img)));
      if (old?.id) {
        await fetch("/api/portfolio", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: old.id, path: old.path }),
        });
      }
      toast.success("Image replaced");
    } catch {
      toast.error("Failed to replace image");
    }
  }

  function handleReorder(next: PortfolioImage[]) {
    setImages(next);
    markDirty();
  }

  if (!isSupabaseConfigured) {
    return (
      <Card className="p-8">
        <CardHeader title="Portfolio Images" />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Supabase is not configured. Add your credentials to enable portfolio management.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onReplaceFile} />

      <Card className="p-8">
        <CardHeader
          title="Portfolio Images"
          description="Upload artwork. Drag cards to reorder — your arrangement is saved with the global Save button."
        />
        <div className="mt-6">
          <UploadArea onFiles={handleFiles} uploading={images.some((i) => i.uploading)} />
        </div>
      </Card>

      <PortfolioGrid
        images={images}
        loading={loading}
        onReorder={handleReorder}
        onEdit={setEditIndex}
        onReplace={replaceImage}
        onDelete={deleteImage}
        onRetry={retryUpload}
      />

      <Modal
        open={editIndex !== null && !!images[editIndex ?? -1]?.url}
        onClose={() => setEditIndex(null)}
        title={`Image ${(editIndex ?? 0) + 1}`}
        footer={
          <Button variant="secondary" onClick={() => setEditIndex(null)}>
            Close
          </Button>
        }
      >
        {editIndex !== null && images[editIndex]?.url && (
          <img src={images[editIndex].url} alt={`Portfolio ${editIndex + 1}`} className="max-h-[60vh] w-full rounded-xl border border-[var(--border)] object-contain" />
        )}
      </Modal>
    </div>
  );
}
