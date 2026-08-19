"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { uploadToSupabaseStorage, deleteFromSupabaseStorage } from "@/lib/supabase-storage";
import { useSave } from "../SaveProvider";
import { useToast } from "../Toast";
import { Card, CardHeader } from "../Card";
import { UploadArea } from "../UploadArea";
import { Button } from "../Button";
import { Field, Input, Textarea, Select } from "../Field";
import { Plus, Trash2, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown, Image as ImageIcon, GitCompare, Layers, Package } from "lucide-react";

interface Adoptable {
  id?: string;
  title: string;
  description: string;
  category: string;
  price: string;
  sfw_price: string;
  nsfw_price: string;
  bundle_price: string;
  sfw_available: boolean;
  nsfw_available: boolean;
  bundle_available: boolean;
  availability: string;
  featured: boolean;
  visible: boolean;
  sort_order: number;
}

interface AdoptableGalleryImage {
  id?: string;
  adoptable_id?: string;
  url: string;
  path?: string;
  sort_order: number;
}

interface AdoptableBeforeAfter {
  id?: string;
  adoptable_id?: string;
  before_url: string;
  after_url: string;
  before_path?: string;
  after_path?: string;
  label: string;
  sort_order: number;
}

export function AdoptablesSection() {
  const sb = supabase!;
  const [projects, setProjects] = useState<Adoptable[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<Record<string, AdoptableGalleryImage[]>>({});
  const [beforeAfters, setBeforeAfters] = useState<Record<string, AdoptableBeforeAfter[]>>({});
  const [mainImages, setMainImages] = useState<Record<string, string>>({});
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const projectsRef = useRef<Adoptable[]>([]);
  const originalIdsRef = useRef<Set<string>>(new Set());
  const mainImageInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
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
          .from("adoptables")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) throw error;
        const loaded = (data || []).map((p: any) => ({
          id: p.id,
          title: p.title || "",
          description: p.description || "",
          category: p.category || "avatar",
          price: p.price || "",
          sfw_price: p.sfw_price || "",
          nsfw_price: p.nsfw_price || "",
          bundle_price: p.bundle_price || "",
          sfw_available: p.sfw_available || false,
          nsfw_available: p.nsfw_available || false,
          bundle_available: p.bundle_available || false,
          availability: p.availability || "available",
          featured: p.featured || false,
          visible: p.visible !== false,
          sort_order: p.sort_order || 0,
        }));
        setProjects(loaded);
        originalIdsRef.current = new Set(loaded.map((p) => p.id).filter(Boolean));

        const mainImgMap: Record<string, string> = {};
        loaded.forEach((p: any) => {
          if (p.main_image) mainImgMap[p.id] = p.main_image;
        });
        setMainImages(mainImgMap);

        const { data: galleryData } = await sb
          .from("adoptable_gallery")
          .select("*")
          .order("sort_order", { ascending: true });
        const galleryMap: Record<string, AdoptableGalleryImage[]> = {};
        (galleryData || []).forEach((img: any) => {
          const mid = img.adoptable_id;
          if (mid) {
            if (!galleryMap[mid]) galleryMap[mid] = [];
            galleryMap[mid].push(img);
          }
        });
        setGalleryImages(galleryMap);

        const { data: baData } = await sb
          .from("adoptable_before_after")
          .select("*")
          .order("sort_order", { ascending: true });
        const baMap: Record<string, AdoptableBeforeAfter[]> = {};
        (baData || []).forEach((ba: any) => {
          const mid = ba.adoptable_id;
          if (mid) {
            if (!baMap[mid]) baMap[mid] = [];
            baMap[mid].push(ba);
          }
        });
        setBeforeAfters(baMap);
      } catch {
        toast.error("Failed to load adoptables");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const saveProjects = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    if (!sb) return;

    const current = projectsRef.current;

    for (const project of current) {
      const payload = {
        title: project.title,
        description: project.description,
        category: project.category,
        price: project.price,
        sfw_price: project.sfw_price,
        nsfw_price: project.nsfw_price,
        bundle_price: project.bundle_price,
        sfw_available: project.sfw_available,
        nsfw_available: project.nsfw_available,
        bundle_available: project.bundle_available,
        availability: project.availability,
        featured: project.featured,
        visible: project.visible,
        sort_order: project.sort_order,
        main_image: (project as any).main_image || null,
        main_image_path: (project as any).main_image_path || null,
      };
      if (project.id) {
        const res = await fetch(`/api/adoptables/${project.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          throw new Error(r.error || "Failed to update adoptable");
        }
      } else {
        const res = await fetch("/api/adoptables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          throw new Error(r.error || "Failed to create adoptable");
        }
        const data = await res.json();
        if (data && data.id) {
          originalIdsRef.current.add(data.id);
        }
      }
    }

    const { data: reloaded, error } = await sb
      .from("adoptables")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && reloaded) {
      setProjects(
        reloaded.map((p: any) => ({
          id: p.id,
          title: p.title || "",
          description: p.description || "",
          category: p.category || "avatar",
          price: p.price || "",
          sfw_price: p.sfw_price || "",
          nsfw_price: p.nsfw_price || "",
          bundle_price: p.bundle_price || "",
          sfw_available: p.sfw_available || false,
          nsfw_available: p.nsfw_available || false,
          bundle_available: p.bundle_available || false,
          availability: p.availability || "available",
          featured: p.featured || false,
          visible: p.visible !== false,
          sort_order: p.sort_order || 0,
        })),
      );
      const mainImgMap: Record<string, string> = {};
      reloaded.forEach((p: any) => {
        if (p.main_image) mainImgMap[p.id] = p.main_image;
      });
      setMainImages(mainImgMap);
      originalIdsRef.current = new Set(
        reloaded.map((p: any) => p.id).filter(Boolean),
      );
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    return register("adoptables", saveProjects);
  }, [register, saveProjects]);

  function updateProject(i: number, patch: Partial<Adoptable>) {
    const next = projects.slice();
    next[i] = { ...next[i], ...patch };
    setProjects(next);
    markDirty();
  }

  async function removeProject(i: number) {
    const project = projects[i];
    if (project.id) {
      try {
        const res = await fetch(`/api/adoptables/${project.id}`, { method: "DELETE" });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          throw new Error(r.error || "Delete failed");
        }
        originalIdsRef.current.delete(project.id);
        toast.success("Adoptable deleted");
      } catch (e: any) {
        toast.error(e.message || "Failed to delete adoptable");
        return;
      }
    }
    setProjects(projects.filter((_, j) => j !== i));
    if (project.id) {
      setMainImages((prev) => {
        const next = { ...prev };
        delete next[project.id!];
        return next;
      });
    }
    markDirty();
  }

  async function addProject() {
    if (!isSupabaseConfigured || !sb) {
      setProjects([
        ...projects,
        { title: "", description: "", category: "avatar", price: "", sfw_price: "", nsfw_price: "", bundle_price: "", sfw_available: false, nsfw_available: false, bundle_available: false, availability: "available", featured: false, visible: true, sort_order: projects.length },
      ]);
      setEditingProject(projects.length);
      markDirty();
      return;
    }
    try {
      const res = await fetch("/api/adoptables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "", description: "", category: "avatar", price: "", sfw_price: "", nsfw_price: "", bundle_price: "", sfw_available: false, nsfw_available: false, bundle_available: false, availability: "available", featured: false, visible: true, sort_order: projects.length }),
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        throw new Error(r.error || "Failed to create adoptable");
      }
      const data = await res.json();
      if (data && data.id) {
        setProjects([
          ...projects,
          { id: data.id, title: "", description: "", category: "avatar", price: "", sfw_price: "", nsfw_price: "", bundle_price: "", sfw_available: false, nsfw_available: false, bundle_available: false, availability: "available", featured: false, visible: true, sort_order: projects.length },
        ]);
        setEditingProject(projects.length);
        originalIdsRef.current.add(data.id);
        markDirty();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create adoptable");
    }
  }

  async function clearAllProjects() {
    if (!window.confirm("This will permanently delete ALL adoptables, gallery images, and comparisons. This cannot be undone. Continue?")) return;
    try {
      const res = await fetch("/api/adoptables", { method: "DELETE" });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        throw new Error(r.error || "Failed to clear adoptables");
      }
      setProjects([]);
      setGalleryImages({});
      setBeforeAfters({});
      setMainImages({});
      originalIdsRef.current = new Set();
      toast.success("All adoptables cleared");
    } catch (e: any) {
      toast.error(e.message || "Failed to clear adoptables");
    }
  }

  async function toggleVisibility(i: number) {
    const project = projects[i];
    const newVisible = !project.visible;
    if (project.id) {
      try {
        const res = await fetch(`/api/adoptables/${project.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visible: newVisible }),
        });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          throw new Error(r.error || "Update failed");
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to update visibility");
        return;
      }
    }
    updateProject(i, { visible: newVisible });
  }

  async function toggleFeatured(i: number) {
    const project = projects[i];
    const newFeatured = !project.featured;
    if (project.id) {
      try {
        const res = await fetch(`/api/adoptables/${project.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featured: newFeatured }),
        });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          throw new Error(r.error || "Update failed");
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to update featured status");
        return;
      }
    }
    updateProject(i, { featured: newFeatured });
  }

  async function handleMainImageUpload(i: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    const project = projects[i];
    let adoptableId: string | null = project.id ?? null;
    if (!adoptableId) {
      adoptableId = await ensureProjectHasId(i);
      if (!adoptableId) {
        toast.error("Save the adoptable first before uploading images");
        return;
      }
    }
    const file = files[0];
    try {
      const storagePath = `adoptables/${adoptableId}/main-${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop() || "bin"}`;
      const { url, path: uploadedPath } = await uploadToSupabaseStorage("adoptables", storagePath, file);

      const res = await fetch(`/api/adoptables/${adoptableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ main_image: url, main_image_path: uploadedPath }),
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        throw new Error(r.error || "Failed to update adoptable");
      }

      setMainImages((prev) => ({ ...prev, [adoptableId!]: url }));
      toast.success("Main image uploaded");
    } catch {
      toast.error("Failed to upload main image");
    }
  }

  async function deleteMainImage(i: number) {
    const project = projects[i];
    if (!project.id) return;
    const path = (project as any).main_image_path;
    try {
      if (path) {
        await deleteFromSupabaseStorage("portfolio-images", path);
      }

      const res = await fetch(`/api/adoptables/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ main_image: null, main_image_path: null }),
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        throw new Error(r.error || "Failed to update adoptable");
      }

      setMainImages((prev) => {
        const next = { ...prev };
        delete next[project.id!];
        return next;
      });
      toast.success("Main image removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove main image");
    }
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

  async function ensureProjectHasId(projectIndex: number): Promise<string | null> {
    const project = projects[projectIndex];
    if (project.id) return project.id;
    try {
      const res = await fetch("/api/adoptables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          category: project.category,
          price: project.price,
          sfw_price: project.sfw_price,
          nsfw_price: project.nsfw_price,
          bundle_price: project.bundle_price,
          sfw_available: project.sfw_available,
          nsfw_available: project.nsfw_available,
          bundle_available: project.bundle_available,
          availability: project.availability,
          featured: project.featured,
          visible: project.visible,
          sort_order: project.sort_order,
        }),
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        throw new Error(r.error || "Failed to create adoptable");
      }
      const data = await res.json();
      if (data && data.id) {
        const next = projects.slice();
        next[projectIndex] = { ...next[projectIndex], id: data.id };
        setProjects(next);
        originalIdsRef.current.add(data.id);
        markDirty();
        return data.id;
      }
      return null;
    } catch (e: any) {
      toast.error(e.message || "Failed to create adoptable");
      return null;
    }
  }

  async function handleGalleryUpload(projectIndex: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    const project = projects[projectIndex];
    let adoptableId: string | null = project.id ?? null;
    if (!adoptableId) {
      adoptableId = await ensureProjectHasId(projectIndex);
      if (!adoptableId) {
        toast.error("Save the adoptable first before uploading images");
        return;
      }
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const temp: AdoptableGalleryImage = { url: "", sort_order: (galleryImages[adoptableId] || []).length + i };
      setGalleryImages((prev) => ({ ...prev, [adoptableId]: [...(prev[adoptableId] || []), temp] }));
      try {
        const storagePath = `adoptables/${adoptableId}/gallery-${Date.now()}-${Math.random().toString(36).slice(2)}-${i}.${file.name.split(".").pop() || "bin"}`;
      const { url, path: uploadedPath } = await uploadToSupabaseStorage("portfolio-images", storagePath, file);

        const res = await fetch(`/api/adoptables/${adoptableId}/gallery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, path: uploadedPath }),
        });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          throw new Error(r.error || "Upload failed");
        }
        const uploaded = await res.json();
        setGalleryImages((prev) => {
          const current = prev[adoptableId] || [];
          return { ...prev, [adoptableId]: current.map((img) => (img === temp ? { id: uploaded.id, url: uploaded.url, path: uploaded.path, sort_order: temp.sort_order } : img)) };
        });
        toast.success("Image uploaded");
      } catch {
        setGalleryImages((prev) => {
          const current = prev[adoptableId] || [];
          return { ...prev, [adoptableId]: current.map((img) => (img === temp ? { ...img, error: "Upload failed" } : img)) };
        });
        toast.error("Failed to upload image");
      }
    }
  }

  async function handleBeforeAfterUpload(projectIndex: number, type: "before" | "after", files: FileList | null) {
    if (!files || files.length === 0) return;
    const project = projects[projectIndex];
    let adoptableId: string | null = project.id ?? null;
    if (!adoptableId) {
      adoptableId = await ensureProjectHasId(projectIndex);
      if (!adoptableId) {
        toast.error("Save the adoptable first before uploading images");
        return;
      }
    }
    const file = files[0];
    const temp: AdoptableBeforeAfter = {
      adoptable_id: adoptableId,
      before_url: type === "before" ? "" : (beforeAfters[adoptableId]?.[0]?.before_url || ""),
      after_url: type === "after" ? "" : (beforeAfters[adoptableId]?.[0]?.after_url || ""),
      label: "",
      sort_order: (beforeAfters[adoptableId] || []).length,
    };
    if (type === "before") temp.before_url = "";
    else temp.after_url = "";

    setBeforeAfters((prev) => ({ ...prev, [adoptableId]: [...(prev[adoptableId] || []), temp] }));

    try {
      const storagePath = `adoptables/${adoptableId}/${type}-${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop() || "bin"}`;
      const { url, path: uploadedPath } = await uploadToSupabaseStorage("portfolio-images", storagePath, file);

      const res = await fetch(`/api/adoptables/${adoptableId}/before-after`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, url, path: uploadedPath }),
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        throw new Error(r.error || "Upload failed");
      }
      const uploaded = await res.json();
      setBeforeAfters((prev) => {
        const current = prev[adoptableId] || [];
        const urlField = type === "before" ? "before_url" : "after_url";
        const pathField = type === "before" ? "before_path" : "after_path";
        return { ...prev, [adoptableId]: current.map((img) => (img === temp ? { ...img, id: uploaded.id || img.id, [urlField]: uploaded.url, [pathField]: uploaded.path } : img)) };
      });
      toast.success(`${type === "before" ? "Before" : "After"} image uploaded`);
    } catch {
      toast.error("Failed to upload image");
    }
  }

  async function deleteGalleryImage(adoptableId: string, imageId: string, path?: string) {
    try {
      if (path) {
        await deleteFromSupabaseStorage("portfolio-images", path);
      }

      const params = new URLSearchParams();
      if (imageId) params.set("imageId", imageId);
      const res = await fetch(`/api/adoptables/${adoptableId}/gallery?${params.toString()}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        throw new Error(r.error || "Delete failed");
      }
      setGalleryImages((prev) => ({
        ...prev,
        [adoptableId]: (prev[adoptableId] || []).filter((img) => img.id !== imageId),
      }));
      toast.success("Image deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete image");
    }
  }

  async function deleteBeforeAfter(adoptableId: string, baId: string, beforePath?: string, afterPath?: string) {
    try {
      if (beforePath) await deleteFromSupabaseStorage("portfolio-images", beforePath);
      if (afterPath) await deleteFromSupabaseStorage("portfolio-images", afterPath);

      const params = new URLSearchParams();
      if (baId) params.set("id", baId);
      const res = await fetch(`/api/adoptables/${adoptableId}/before-after?${params.toString()}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        throw new Error(r.error || "Delete failed");
      }
      setBeforeAfters((prev) => ({
        ...prev,
        [adoptableId]: (prev[adoptableId] || []).filter((ba) => ba.id !== baId),
      }));
      toast.success("Comparison deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete comparison");
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <Card className="p-8">
        <CardHeader title="Adoptables" description="Manage adoptable listings." />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">Supabase is not configured. Add your credentials to enable adoptable management.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-[var(--accent)]/5 blur-[120px] orb-slow" />
      <Card className="p-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 h-[200px] w-[200px] rounded-full bg-[var(--accent-2)]/5 blur-[100px] orb-med" />
        <CardHeader
          title="Adoptables"
          description="Manage your adoptable listings. Each adoptable can have gallery images and before/after comparisons."
          actions={
            <>
              {projects.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clearAllProjects} leftIcon={<Trash2 className="h-4 w-4" />} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                  Clear All
                </Button>
              )}
              <Button size="sm" variant="primary" onClick={addProject} leftIcon={<Plus className="h-4 w-4" />}>
                Add Adoptable
              </Button>
            </>
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
              <div key={project.id || i} className="ad-section-card ad-section-card-hover p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => moveProject(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-dim)] hover:text-white disabled:opacity-30" aria-label="Move up">
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => moveProject(i, 1)} disabled={i === projects.length - 1} className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-dim)] hover:text-white disabled:opacity-30" aria-label="Move down">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <h3 className="text-sm font-semibold text-white">{project.title || `Adoptable ${i + 1}`}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => toggleVisibility(i)} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${project.visible ? "text-[var(--accent)] bg-[var(--accent-soft)]" : "text-[var(--text-dim)] hover:bg-white/5"}`} aria-label={project.visible ? "Hide adoptable" : "Show adoptable"}>
                      {project.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={() => toggleFeatured(i)} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${project.featured ? "text-[var(--accent)] bg-[var(--accent-soft)]" : "text-[var(--text-dim)] hover:bg-white/5"}`} aria-label={project.featured ? "Unfeature adoptable" : "Feature adoptable"}>
                      <Layers className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => removeProject(i)} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-dim)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]" aria-label="Delete adoptable">
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
                  <Field label="Category">
                    <Select value={project.category} onChange={(e) => updateProject(i, { category: e.target.value })}>
                      <option value="avatar">Avatar</option>
                      <option value="accessory">Accessory</option>
                      <option value="clothing">Clothing</option>
                      <option value="texture">Texture</option>
                      <option value="other">Other</option>
                    </Select>
                  </Field>
                  <Field label="Availability">
                    <Select value={project.availability} onChange={(e) => updateProject(i, { availability: e.target.value })}>
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="reserved">Reserved</option>
                    </Select>
                  </Field>

                <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-3">Main Image</p>
                  <div className="flex items-center gap-4">
                    {mainImages[project.id || ""] ? (
                      <div className="relative group">
                        <img src={mainImages[project.id || ""]} alt="Main" className="h-20 w-20 rounded-lg border border-[var(--border)] object-cover" />
                        <button type="button" onClick={() => project.id && deleteMainImage(i)} className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--danger)] text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete main image">×</button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-lg border border-dashed border-[var(--border)] flex items-center justify-center text-[var(--text-dim)]">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <input
                        ref={(el) => {
                          mainImageInputRefs.current[i] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            handleMainImageUpload(i, files);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = mainImageInputRefs.current[i];
                          if (input) input.click();
                        }}
                        className="btn-secondary !py-1.5 !px-3 !text-xs"
                      >
                        {mainImages[project.id || ""] ? "Replace" : "Upload"} Main Image
                      </button>
                      <p className="mt-1 text-[10px] text-[var(--text-dim)]">Recommended: 1200x1200px or larger</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">Pricing</p>

                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <input type="checkbox" checked={project.sfw_available} onChange={(e) => updateProject(i, { sfw_available: e.target.checked })} className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                      SFW available
                    </label>
                    <div className="flex-1">
                      <Input value={project.sfw_price} onChange={(e) => updateProject(i, { sfw_price: e.target.value })} placeholder="SFW price, e.g. £20" disabled={!project.sfw_available} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <input type="checkbox" checked={project.nsfw_available} onChange={(e) => updateProject(i, { nsfw_available: e.target.checked })} className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                      NSFW available
                    </label>
                    <div className="flex-1">
                      <Input value={project.nsfw_price} onChange={(e) => updateProject(i, { nsfw_price: e.target.value })} placeholder="NSFW price, e.g. £30" disabled={!project.nsfw_available} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <input type="checkbox" checked={project.bundle_available} onChange={(e) => updateProject(i, { bundle_available: e.target.checked })} className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                      Bundle available
                    </label>
                    <div className="flex-1">
                      <Input value={project.bundle_price} onChange={(e) => updateProject(i, { bundle_price: e.target.value })} placeholder="Bundle price, e.g. £40" disabled={!project.bundle_available} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--text-secondary)]">Legacy price</span>
                    <div className="flex-1">
                      <Input value={project.price} onChange={(e) => updateProject(i, { price: e.target.value })} placeholder="Fallback price (optional)" />
                    </div>
                  </div>
                </div>
                </div>

                <Field label="Description" className="mt-4">
                  <Textarea rows={3} value={project.description} onChange={(e) => updateProject(i, { description: e.target.value })} />
                </Field>

                <div className="mt-4 flex flex-wrap items-center gap-6">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                    <input type="checkbox" checked={project.featured} onChange={(e) => updateProject(i, { featured: e.target.checked })} className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                    Featured adoptable
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
                       <div key={ba.id || bi} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 glass">
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
                      <UploadArea onFiles={(files) => handleBeforeAfterUpload(i, "before", files)} uploading={false} title="Upload Before" formats={["PNG", "JPG", "WEBP"]} inputId={`adoptable-before-${i}`} />
                    </div>
                    <div className="flex-1">
                      <label className="ad-label">After Image</label>
                      <UploadArea onFiles={(files) => handleBeforeAfterUpload(i, "after", files)} uploading={false} title="Upload After" formats={["PNG", "JPG", "WEBP"]} inputId={`adoptable-after-${i}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] glass py-16 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Package className="h-6 w-6" />
                </div>
                <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">No adoptables yet. Add your first adoptable to get started.</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
