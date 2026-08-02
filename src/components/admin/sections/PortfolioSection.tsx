"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getPortfolioImages, getPortfolioCategories } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useSave } from "../SaveProvider";
import { useToast } from "../Toast";
import { Card, CardHeader } from "../Card";
import { UploadArea } from "../UploadArea";
import { PortfolioGrid, type PortfolioImage } from "../PortfolioGrid";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { Field, Input } from "../Field";

export function PortfolioSection() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [uploadCategory, setUploadCategory] = useState("VRChat Avatars");
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
        const [imgs, cats] = await Promise.all([
          getPortfolioImages(),
          getPortfolioCategories(),
        ]);
        setImages(imgs.map((i: any) => ({ id: i.id, url: i.url, path: i.path, category: i.category })).filter((x: any) => x.url));
        const catNames = cats.map((c: any) => c.name).filter(Boolean);
        setCategories(catNames);
        if (catNames.length > 0) setUploadCategory(catNames[0]);
      } catch {
        toast.error("Failed to load portfolio data");
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

  async function uploadOne(file: File): Promise<{ id: string; url: string; path: string; category: string } | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "portfolio");
    formData.append("category", uploadCategory);
    const res = await fetch("/api/portfolio/upload", { method: "POST", body: formData });
    const result = await res.json();
    if (res.ok && result.id) return { id: result.id, url: result.url, path: result.path, category: result.category || uploadCategory };
    throw new Error(result.error || "Upload failed");
  }

  async function addCategory() {
    const name = newCategory.trim();
    if (!name || categories.includes(name)) return;
    const res = await fetch("/api/portfolio/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setCategories([...categories, name]);
      setNewCategory("");
      setUploadCategory(name);
      toast.success("Category added");
    } else {
      toast.error("Failed to add category");
    }
  }

  async function removeCategory(name: string) {
    const res = await fetch(`/api/portfolio/categories?name=${encodeURIComponent(name)}`, { method: "DELETE" });
    if (res.ok) {
      setCategories(categories.filter((c) => c !== name));
      if (uploadCategory === name && categories.length > 1) {
        setUploadCategory(categories.find((c) => c !== name) || "");
      }
      toast.success("Category removed");
    } else {
      toast.error("Failed to remove category");
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
        setImages((prev) => prev.map((img) => (img === temp ? { id: uploaded!.id, url: uploaded!.url, path: uploaded!.path, category: uploaded!.category } : img)));
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
        setImages((prev) => prev.map((img, i) => (i === index ? { id: uploaded!.id, url: uploaded!.url, path: uploaded!.path, category: uploaded!.category, uploading: false, retrying: false, error: undefined } : img)));
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
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">Category</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="ad-field rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[var(--accent)]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                {cat}
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  className="text-[var(--text-dim)] hover:text-[var(--danger)] transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1.5">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category"
                className="!h-8 !text-xs !py-1 !px-2 w-40"
              />
              <Button size="sm" variant="secondary" onClick={addCategory} className="!h-8 !text-xs">Add</Button>
            </div>
          </div>
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
