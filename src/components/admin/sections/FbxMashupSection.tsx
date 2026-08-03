"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useSave } from "../SaveProvider";
import { useToast } from "../Toast";
import { Card, CardHeader } from "../Card";
import { UploadArea } from "../UploadArea";
import { Button } from "../Button";
import { Field, Input, Textarea, Select } from "../Field";
import { Plus, Trash2, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown, Image as ImageIcon, GitCompare, Layers } from "lucide-react";

interface FbxMashup {
  id?: string;
  title: string;
  description: string;
  avatar_base: string;
  software_used: string[];
  price: string;
  featured: boolean;
  visible: boolean;
  sort_order: number;
}

interface FbxGalleryImage {
  id?: string;
  mashup_id?: string;
  url: string;
  path?: string;
  sort_order: number;
}

interface FbxBeforeAfter {
  id?: string;
  mashup_id?: string;
  before_url: string;
  after_url: string;
  before_path?: string;
  after_path?: string;
  label: string;
  sort_order: number;
}

export function FbxMashupSection() {
  const sb = supabase!;
  const [projects, setProjects] = useState<FbxMashup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<Record<string, FbxGalleryImage[]>>({});
  const [beforeAfters, setBeforeAfters] = useState<Record<string, FbxBeforeAfter[]>>({});
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const projectsRef = useRef<FbxMashup[]>([]);
  const { markDirty, register } = useSave();
  const toast = useToast();

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        if (!sb) throw new Error("Supabase not configured");
        const { data, error } = await sb
          .from("fbx_mashups")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) throw error;
        setProjects((data || []).map((p: any) => ({
          id: p.id,
          title: p.title || "",
          description: p.description || "",
          avatar_base: p.avatar_base || "",
          software_used: p.software_used || [],
          price: p.price || "",
          featured: p.featured || false,
          visible: p.visible !== false,
          sort_order: p.sort_order || 0,
        })));
      } catch {
        toast.error("Failed to load FBX mashups");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const saveOrder = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const items = projectsRef.current
      .filter((p) => p.id)
      .map((p) => ({ id: p.id!, sort_order: p.sort_order }));
    if (items.length === 0) return;
    if (!sb) return;
    for (const item of items) {
      await sb.from("fbx_mashups").update({ sort_order: item.sort_order }).eq("id", item.id);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    return register("fbx-mashups", saveOrder);
  }, [register, saveOrder]);

  function updateProject(i: number, patch: Partial<FbxMashup>) {
    const next = projects.slice();
    next[i] = { ...next[i], ...patch };
    setProjects(next);
    markDirty();
  }

  function removeProject(i: number) {
    setProjects(projects.filter((_, j) => j !== i));
    markDirty();
  }

  function addProject() {
    setProjects([
      ...projects,
      { title: "", description: "", avatar_base: "", software_used: [], price: "", featured: false, visible: true, sort_order: projects.length },
    ]);
    setEditingProject(projects.length);
    markDirty();
  }

  function toggleVisibility(i: number) {
    updateProject(i, { visible: !projects[i].visible });
  }

  function toggleFeatured(i: number) {
    updateProject(i, { featured: !projects[i].featured });
  }

  function moveProject(i: number, dir: number) {
    const next = projects.slice();
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    next.forEach((p, idx) => (p.sort_order = idx));
    setProjects(next);
    markDirty();
  }

  async function uploadMashupImage(file: File, mashupId?: string): Promise<{ id: string; url: string; path: string } | null> {
    const ext = file.name.split(".").pop();
    const storagePath = `fbx-mashups/${mashupId || "temp"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data: uploadData, error: uploadError } = await sb.storage
      .from("fbx-mashups")
      .upload(storagePath, file, { cacheControl: "3600", upsert: true });
    if (uploadError || !uploadData) return null;
    const { data: urlData } = sb.storage.from("fbx-mashups").getPublicUrl(storagePath);
    const url = urlData.publicUrl;
    return { id: "", url, path: storagePath };
  }

  async function handleGalleryUpload(projectIndex: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    const project = projects[projectIndex];
    const mashupId = project.id;
    if (!mashupId) {
      toast.error("Save the project first before uploading images");
      return;
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const temp: FbxGalleryImage = { url: "", sort_order: (galleryImages[mashupId] || []).length + i };
      setGalleryImages((prev) => ({ ...prev, [mashupId]: [...(prev[mashupId] || []), temp] }));
      try {
        const uploaded = await uploadMashupImage(file, mashupId);
        if (uploaded) {
          const { data: dbData, error: dbError } = await sb
            .from("fbx_gallery")
            .insert([{ mashup_id: mashupId, url: uploaded.url, path: uploaded.path, sort_order: temp.sort_order }])
            .select();
          if (dbError || !dbData || dbData.length === 0) throw new Error("DB insert failed");
          setGalleryImages((prev) => {
            const current = prev[mashupId] || [];
            return { ...prev, [mashupId]: current.map((img, idx) => (img === temp ? { id: dbData[0].id, url: dbData[0].url, path: dbData[0].path, sort_order: temp.sort_order } : img)) };
          });
          toast.success("Image uploaded");
        }
      } catch {
        setGalleryImages((prev) => {
          const current = prev[mashupId] || [];
          return { ...prev, [mashupId]: current.map((img, idx) => (img === temp ? { ...img, uploading: false, error: "Upload failed" } : img)) };
        });
        toast.error("Failed to upload image");
      }
    }
  }

  async function handleBeforeAfterUpload(projectIndex: number, type: "before" | "after", files: FileList | null) {
    if (!files || files.length === 0) return;
    const project = projects[projectIndex];
    const mashupId = project.id;
    if (!mashupId) {
      toast.error("Save the project first before uploading images");
      return;
    }
    const file = files[0];
    const temp: FbxBeforeAfter = {
      mashup_id: mashupId,
      before_url: type === "before" ? "" : (beforeAfters[mashupId]?.[0]?.before_url || ""),
      after_url: type === "after" ? "" : (beforeAfters[mashupId]?.[0]?.after_url || ""),
      label: "",
      sort_order: (beforeAfters[mashupId] || []).length,
    };
    if (type === "before") temp.before_url = "";
    else temp.after_url = "";

    setBeforeAfters((prev) => ({ ...prev, [mashupId]: [...(prev[mashupId] || []), temp] }));

    try {
      const uploaded = await uploadMashupImage(file, mashupId);
      if (uploaded) {
        const field = type === "before" ? "before_url" : "after_url";
        const pathField = type === "before" ? "before_path" : "after_path";
        const { data: dbData, error: dbError } = await sb
          .from("fbx_before_after")
          .insert([{ mashup_id: mashupId, [field]: uploaded.url, [pathField]: uploaded.path, label: "", sort_order: temp.sort_order }])
          .select();
        if (dbError || !dbData || dbData.length === 0) throw new Error("DB insert failed");
        setBeforeAfters((prev) => {
          const current = prev[mashupId] || [];
          return { ...prev, [mashupId]: current.map((img, idx) => (img === temp ? { id: dbData[0].id, mashup_id: mashupId, before_url: dbData[0].before_url, after_url: dbData[0].after_url, before_path: dbData[0].before_path, after_path: dbData[0].after_path, label: dbData[0].label, sort_order: temp.sort_order } : img)) };
        });
        toast.success(`${type === "before" ? "Before" : "After"} image uploaded`);
      }
    } catch {
      toast.error("Failed to upload image");
    }
  }

  async function deleteGalleryImage(mashupId: string, imageId: string, path?: string) {
    if (path) await sb.storage.from("fbx-mashups").remove([path]);
    await sb.from("fbx_gallery").delete().eq("id", imageId);
    setGalleryImages((prev) => ({
      ...prev,
      [mashupId]: (prev[mashupId] || []).filter((img) => img.id !== imageId),
    }));
    toast.success("Image deleted");
  }

  async function deleteBeforeAfter(mashupId: string, baId: string, beforePath?: string, afterPath?: string) {
    if (beforePath) await sb.storage.from("fbx-mashups").remove([beforePath]);
    if (afterPath) await sb.storage.from("fbx-mashups").remove([afterPath]);
    await sb.from("fbx_before_after").delete().eq("id", baId);
    setBeforeAfters((prev) => ({
      ...prev,
      [mashupId]: (prev[mashupId] || []).filter((ba) => ba.id !== baId),
    }));
    toast.success("Comparison deleted");
  }

  if (!isSupabaseConfigured) {
    return (
      <Card className="p-8">
        <CardHeader title="FBX Mashups" description="Manage FBX mashup projects." />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">Supabase is not configured. Add your credentials to enable FBX mashup management.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <CardHeader
          title="FBX Mashup Projects"
          description="Manage your FBX mashup services. Each project is a separate mashup offering with its own gallery and before/after comparisons."
          actions={
            <Button size="sm" variant="primary" onClick={addProject} leftIcon={<Plus className="h-4 w-4" />}>
              Add Project
            </Button>
          }
        />

        {loading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-[var(--bg)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {projects.map((project, i) => (
              <div key={project.id || i} className="ad-panel ad-panel-hover p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => moveProject(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-dim)] hover:text-white disabled:opacity-30" aria-label="Move up">
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => moveProject(i, 1)} disabled={i === projects.length - 1} className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-dim)] hover:text-white disabled:opacity-30" aria-label="Move down">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <h3 className="text-sm font-semibold text-white">{project.title || `Project ${i + 1}`}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => toggleVisibility(i)} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${project.visible ? "text-[var(--accent)] bg-[var(--accent-soft)]" : "text-[var(--text-dim)] hover:bg-white/5"}`} aria-label={project.visible ? "Hide project" : "Show project"}>
                      {project.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={() => toggleFeatured(i)} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${project.featured ? "text-[var(--accent)] bg-[var(--accent-soft)]" : "text-[var(--text-dim)] hover:bg-white/5"}`} aria-label={project.featured ? "Unfeature project" : "Feature project"}>
                      <Layers className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => removeProject(i)} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]" aria-label="Delete project">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Title">
                    <Input value={project.title} onChange={(e) => updateProject(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Price">
                    <Input value={project.price} onChange={(e) => updateProject(i, { price: e.target.value })} placeholder="£XX - £XX" />
                  </Field>
                  <Field label="Avatar Base">
                    <Input value={project.avatar_base} onChange={(e) => updateProject(i, { avatar_base: e.target.value })} placeholder="e.g. VRChat Base" />
                  </Field>
                  <Field label="Software Used (comma-separated)">
                    <Input value={(project.software_used || []).join(", ")} onChange={(e) => updateProject(i, { software_used: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} placeholder="Blender, Unity" />
                  </Field>
                </div>

                <Field label="Description" className="mt-4">
                  <Textarea rows={3} value={project.description} onChange={(e) => updateProject(i, { description: e.target.value })} />
                </Field>

                <div className="mt-4 flex flex-wrap items-center gap-6">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <input type="checkbox" checked={project.featured} onChange={(e) => updateProject(i, { featured: e.target.checked })} className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                    Featured project
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <input type="checkbox" checked={project.visible} onChange={(e) => updateProject(i, { visible: e.target.checked })} className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                    Visible on site
                  </label>
                </div>

                {/* Gallery Images */}
                <div className="mt-5">
                  <h4 className="mb-3 text-sm font-semibold text-white flex items-center gap-2"><ImageIcon className="h-4 w-4 text-[var(--accent)]" /> Gallery Images</h4>
                  <UploadArea onFiles={(files) => handleGalleryUpload(i, files)} uploading={false} title="Upload Gallery Images" />
                  <div className="mt-3 flex flex-wrap gap-3">
                    {(galleryImages[project.id || ""] || []).map((img, gi) => (
                      <div key={img.id || gi} className="relative group">
                        <img src={img.url} alt={`Gallery ${gi + 1}`} className="h-20 w-20 rounded-lg border border-[var(--border)] object-cover" />
                        <button type="button" onClick={() => project.id && deleteGalleryImage(project.id, img.id!, img.path)} className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--danger)] text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete image">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Before & After */}
                <div className="mt-5">
                  <h4 className="mb-3 text-sm font-semibold text-white flex items-center gap-2"><GitCompare className="h-4 w-4 text-[var(--accent)]" /> Before &amp; After Comparisons</h4>
                  <div className="space-y-3">
                    {(beforeAfters[project.id || ""] || []).map((ba, bi) => (
                      <div key={ba.id || bi} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                        <img src={ba.before_url} alt="Before" className="h-16 w-16 rounded-lg border border-[var(--border)] object-cover" />
                        <span className="text-[var(--text-dim)] text-xs">→</span>
                        <img src={ba.after_url} alt="After" className="h-16 w-16 rounded-lg border border-[var(--border)] object-cover" />
                        <Field label="Label" className="flex-1">
                          <Input value={ba.label} onChange={(e) => {
                            const next = (beforeAfters[project.id || ""] || []).slice();
                            next[bi] = { ...next[bi], label: e.target.value };
                            setBeforeAfters((prev) => ({ ...prev, [project.id || ""]: next }));
                          }} />
                        </Field>
                        <button type="button" onClick={() => project.id && deleteBeforeAfter(project.id, ba.id!, ba.before_path, ba.after_path)} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]" aria-label="Delete comparison">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-3">
                    <div className="flex-1">
                      <label className="ad-label">Before Image</label>
                      <UploadArea onFiles={(files) => handleBeforeAfterUpload(i, "before", files)} uploading={false} title="Upload Before" formats={["PNG", "JPG", "WEBP"]} inputId={`fbx-before-${i}`} />
                    </div>
                    <div className="flex-1">
                      <label className="ad-label">After Image</label>
                      <UploadArea onFiles={(files) => handleBeforeAfterUpload(i, "after", files)} uploading={false} title="Upload After" formats={["PNG", "JPG", "WEBP"]} inputId={`fbx-after-${i}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Layers className="h-6 w-6" />
                </div>
                <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">No FBX mashup projects yet. Add your first project to get started.</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}