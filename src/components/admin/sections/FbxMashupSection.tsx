"use client";

import { useState } from "react";
import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2, GripVertical, Eye, EyeOff, Star, Upload, Layers } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

interface FbxMashup {
  id?: string;
  title: string;
  model_a: string;
  model_b: string;
  price: string;
  description: string;
  image_url: string;
  how_to_get: string;
  tags: string[];
  featured: boolean;
  sort_order: number;
  visible: boolean;
  created_at?: string;
}

interface Props {
  value: FbxMashup[];
  onChange: (next: FbxMashup[]) => void;
}

export function FbxMashupSection({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  function update(i: number, patch: Partial<FbxMashup>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }

  function add() {
    const maxSort = value.length > 0 ? Math.max(...value.map((v) => v.sort_order || 0)) : -1;
    onChange([
      ...value,
      {
        id: undefined,
        title: "New Mashup",
        model_a: "",
        model_b: "",
        price: "",
        description: "",
        image_url: "",
        how_to_get: "",
        tags: [],
        featured: false,
        sort_order: maxSort + 1,
        visible: true,
      },
    ]);
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const next = value.slice();
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    next[i - 1].sort_order = i - 1;
    next[i].sort_order = i;
    onChange(next);
  }

  function moveDown(i: number) {
    if (i === value.length - 1) return;
    const next = value.slice();
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    next[i].sort_order = i;
    next[i + 1].sort_order = i + 1;
    onChange(next);
  }

  async function handleImageUpload(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "fbx-mashups");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (res.ok && result.url) {
        update(i, { image_url: result.url });
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="p-8">
      <CardHeader
        title="FBX Mashups"
        description="Manage pre-made FBX mashup listings"
        actions={
          <Button size="sm" variant="primary" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
            Add Mashup
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {value.map((mashup, i) => {
          const isVisible = mashup.visible !== false;
          return (
            <div
              key={mashup.id || i}
              draggable
              className={`ad-panel ad-panel-hover p-5 ${!isVisible ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="cursor-grab text-[var(--text-dim)] hover:text-white"
                    aria-label="Drag to reorder"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <h3 className="text-sm font-semibold text-white">Mashup {i + 1}</h3>
                  {mashup.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
                      <Star className="h-3 w-3" /> Featured
                    </span>
                  )}
                  {!isVisible && (
                    <span className="inline-flex items-center rounded-full bg-[var(--text-dim)]/10 px-2 py-0.5 text-xs font-medium text-[var(--text-dim)]">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => moveUp(i)} disabled={i === 0}>
                    Up
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => moveDown(i)} disabled={i === value.length - 1}>
                    Down
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => update(i, { visible: !isVisible })}>
                    {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(i)} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Title">
                  <Input value={mashup.title} onChange={(e) => update(i, { title: e.target.value })} />
                </Field>
                <Field label="Price">
                  <Input value={mashup.price} onChange={(e) => update(i, { price: e.target.value })} placeholder="$50" />
                </Field>
                <Field label="Model A (Avatar Base)">
                  <Input value={mashup.model_a} onChange={(e) => update(i, { model_a: e.target.value })} placeholder="e.g. Lofi Girl" />
                </Field>
                <Field label="Model B (Avatar Base)">
                  <Input value={mashup.model_b} onChange={(e) => update(i, { model_b: e.target.value })} placeholder="e.g. Anime Base" />
                </Field>
                <Field label="How to Get">
                  <Input value={mashup.how_to_get} onChange={(e) => update(i, { how_to_get: e.target.value })} placeholder="Discord DM or store link" />
                </Field>
                <Field label="Tags (comma separated)">
                  <Input
                    value={mashup.tags.join(", ")}
                    onChange={(e) => update(i, { tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                    placeholder="cute, casual, popular"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Description">
                  <Textarea rows={3} value={mashup.description} onChange={(e) => update(i, { description: e.target.value })} />
                </Field>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Field label="Image">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(i, e)}
                        className="hidden"
                        id={`fbx-image-${i}`}
                      />
                      <label
                        htmlFor={`fbx-image-${i}`}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text-dim)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-secondary)]"
                      >
                        <Upload className="h-4 w-4" />
                        {uploading ? "Uploading..." : "Upload Image"}
                      </label>
                      {mashup.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mashup.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                    </div>
                  </Field>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={mashup.featured}
                      onChange={(e) => update(i, { featured: e.target.checked })}
                      className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    Featured
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {value.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg)] py-12 text-center">
          <Layers className="mx-auto mb-3 h-10 w-10 text-[var(--text-dim)]" />
          <p className="text-sm text-[var(--text-dim)]">No FBX mashups yet. Click &quot;Add Mashup&quot; to get started.</p>
        </div>
      )}
    </Card>
  );
}
