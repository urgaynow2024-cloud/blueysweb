"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Adoptable, AdoptableBeforeAfter, AdoptableGalleryImage, AdoptableStatus } from "@/types/database";
import { normalizeStatus, visibleForStatus } from "@/lib/adoptables/status";
import { uploadMedia } from "@/lib/upload/client";
import { UploadError } from "@/lib/upload/errors";

export interface GalleryDraft {
  id?: string;
  url: string;
  path?: string | null;
  is_nsfw: boolean;
  sort_order: number;
  /** Present while an upload is in flight or after it failed. */
  pending?: boolean;
  error?: string;
}

export interface ComparisonDraft {
  id?: string;
  adoptable_id?: string;
  before_url?: string | null;
  after_url?: string | null;
  before_path?: string | null;
  after_path?: string | null;
  label: string;
  sort_order: number;
  pending?: boolean;
  error?: string;
}

type GalleryMap = Record<string, GalleryDraft[]>;
type ComparisonMap = Record<string, ComparisonDraft[]>;

export interface AdoptablesController {
  adoptables: Adoptable[];
  gallery: GalleryMap;
  comparisons: ComparisonMap;
  loading: boolean;
  error: string | null;
  /** Ids with unsaved editor changes, surfaced as a dot on the card. */
  dirtyIds: Set<string>;
  busyIds: Set<string>;

  reload: () => Promise<void>;
  markDirty: (id: string, dirty?: boolean) => void;

  createAdoptable: (seed?: Partial<Adoptable>) => Promise<string | null>;
  saveAdoptable: (id: string, patch: Partial<Adoptable>) => Promise<boolean>;
  setStatus: (id: string, status: AdoptableStatus) => Promise<boolean>;
  setStatusBulk: (ids: string[], status: AdoptableStatus) => Promise<number>;
  setFeatured: (id: string, featured: boolean) => Promise<boolean>;
  moveOrder: (id: string, direction: -1 | 1) => Promise<boolean>;
  removeAdoptable: (id: string) => Promise<boolean>;
  removeBulk: (ids: string[]) => Promise<boolean>;
  deleteEverything: () => Promise<boolean>;

  uploadMainImage: (id: string, file: File) => Promise<boolean>;
  removeMainImage: (id: string) => Promise<boolean>;
  uploadGallery: (id: string, files: FileList | File[]) => Promise<boolean>;
  /** Clears a failed-upload placeholder that was never persisted. */
  dismissGalleryDraft: (id: string, draft: GalleryDraft) => void;
  setGalleryNsfw: (id: string, imageId: string, isNsfw: boolean) => Promise<boolean>;
  moveGalleryImage: (id: string, from: number, to: number) => Promise<boolean>;
  removeGalleryImage: (id: string, imageId: string) => Promise<boolean>;

  uploadComparisonSide: (id: string, side: "before" | "after", file: File) => Promise<boolean>;
  setComparisonLabel: (id: string, comparisonId: string, label: string) => Promise<boolean>;
  removeComparison: (id: string, comparisonId: string) => Promise<boolean>;
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    if (body?.error) return String(body.error);
    return `${fallback} (HTTP ${response.status})`;
  } catch {
    return `${fallback} (HTTP ${response.status})`;
  }
}

function isNsfwFilename(file: File): boolean {
  return file.name.toLowerCase().includes("nsfw");
}

function isVideo(file: File): boolean {
  return file.type.startsWith("video/");
}

export function useAdoptables(): AdoptablesController {
  const [adoptables, setAdoptables] = useState<Adoptable[]>([]);
  const [gallery, setGallery] = useState<GalleryMap>({});
  const [comparisons, setComparisons] = useState<ComparisonMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const setBusy = useCallback((id: string, busy: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const listRes = await fetch("/api/adoptables");
      if (!listRes.ok) {
        const message = await readError(listRes, "Failed to load adoptables");
        if (mounted.current) setError(message);
        return;
      }
      const rows: Adoptable[] = await listRes.json();

      // Media is fetched per adoptable so a failure on one does not blank the
      // whole dashboard; the adoptable list itself stays usable.
      const galleryEntries = await Promise.all(
        rows.map(async (row) => {
          const res = await fetch(`/api/adoptables/${row.id}/gallery`).catch(() => null);
          if (!res || !res.ok) return [row.id, [] as AdoptableGalleryImage[]] as const;
          return [row.id, ((await res.json().catch(() => [])) as AdoptableGalleryImage[])] as const;
        }),
      );

      const comparisonEntries = await Promise.all(
        rows.map(async (row) => {
          const res = await fetch(`/api/adoptables/${row.id}/before-after?adoptableId=${row.id}`).catch(() => null);
          if (!res || !res.ok) return [row.id, [] as AdoptableBeforeAfter[]] as const;
          return [row.id, ((await res.json().catch(() => [])) as AdoptableBeforeAfter[])] as const;
        }),
      );

      if (!mounted.current) return;

      const nextGallery: GalleryMap = {};
      for (const [id, images] of galleryEntries) {
        nextGallery[id] = (images ?? []).map((img) => ({
          id: img.id,
          url: img.url,
          path: img.path ?? img.storage_path ?? null,
          is_nsfw: Boolean(img.is_nsfw),
          sort_order: img.sort_order ?? 0,
        }));
      }

      const nextComparisons: ComparisonMap = {};
      for (const [id, rowsBA] of comparisonEntries) {
        nextComparisons[id] = (rowsBA ?? []).map((ba) => ({
          id: ba.id,
          adoptable_id: ba.adoptable_id ?? id,
          before_url: ba.before_url ?? null,
          after_url: ba.after_url ?? null,
          before_path: ba.before_path ?? null,
          after_path: ba.after_path ?? null,
          label: ba.label ?? "",
          sort_order: ba.sort_order ?? 0,
        }));
      }

      setAdoptables(rows);
      setGallery(nextGallery);
      setComparisons(nextComparisons);
      setDirtyIds(new Set());
    } catch (e: any) {
      if (mounted.current) setError(e?.message || "Failed to load adoptables");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const patchLocal = useCallback((id: string, patch: Partial<Adoptable>) => {
    setAdoptables((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }, []);

  const markDirty = useCallback((id: string, dirty = true) => {
    setDirtyIds((prev) => {
      const next = new Set(prev);
      if (dirty) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const createAdoptable = useCallback(
    async (seed?: Partial<Adoptable>) => {
      const status = normalizeStatus(seed?.availability);
      const body = {
        title: seed?.title ?? "Untitled adoptable",
        description: seed?.description ?? "",
        category: seed?.category ?? "avatar",
        availability: status,
        featured: seed?.featured ?? false,
        sort_order: (seed?.sort_order ?? adoptables.length) as number,
        species: seed?.species ?? "",
        sfw_price: "",
        nsfw_price: "",
        bundle_price: "",
        sfw_available: false,
        nsfw_available: false,
        bundle_available: false,
      };

      try {
        const res = await fetch("/api/adoptables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await readError(res, "Failed to create adoptable"));
        const row: Adoptable = await res.json();
        setAdoptables((prev) => [...prev, { ...row, availability: status, visible: visibleForStatus(status) }]);
        return row.id;
      } catch (e: any) {
        if (mounted.current) setError(e?.message || "Failed to create adoptable");
        return null;
      }
    },
    [adoptables.length],
  );

  const saveAdoptable = useCallback(
    async (id: string, patch: Partial<Adoptable>) => {
      // Optimistic update keeps the card responsive; reverted on failure so the
      // admin never sees a change that was not persisted.
      const previous = adoptables.find((row) => row.id === id);
      patchLocal(id, patch);
      setBusy(id, true);
      try {
        const res = await fetch(`/api/adoptables/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error(await readError(res, "Failed to save adoptable"));
        const saved: Adoptable = await res.json();
        setAdoptables((prev) =>
          prev.map((row) => (row.id === id ? { ...row, ...saved, availability: normalizeStatus(saved.availability) } : row)),
        );
        markDirty(id, false);
        return true;
      } catch (e: any) {
        if (previous) patchLocal(id, previous);
        if (mounted.current) setError(e?.message || "Failed to save adoptable");
        return false;
      } finally {
        setBusy(id, false);
      }
    },
    [adoptables, markDirty, patchLocal, setBusy],
  );

  const setStatus = useCallback(
    async (id: string, status: AdoptableStatus) => {
      const previous = adoptables.find((row) => row.id === id);
      patchLocal(id, { availability: status, visible: visibleForStatus(status) });
      setBusy(id, true);
      try {
        const res = await fetch(`/api/adoptables/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error(await readError(res, "Failed to update status"));
        const body = await res.json();
        setAdoptables((prev) =>
          prev.map((row) =>
            row.id === id
              ? { ...row, ...(body.adoptable ?? {}), availability: normalizeStatus(body.adoptable?.availability ?? status) }
              : row,
          ),
        );
        markDirty(id, false);
        return true;
      } catch (e: any) {
        if (previous) patchLocal(id, previous);
        if (mounted.current) setError(e?.message || "Failed to update status");
        return false;
      } finally {
        setBusy(id, false);
      }
    },
    [adoptables, markDirty, patchLocal, setBusy],
  );

  const setStatusBulk = useCallback(
    async (ids: string[], status: AdoptableStatus) => {
      if (ids.length === 0) return 0;
      try {
        const res = await fetch("/api/adoptables/bulk", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", ids, status }),
        });
        if (!res.ok) throw new Error(await readError(res, "Bulk status update failed"));
        await reload();
        return ids.length;
      } catch (e: any) {
        if (mounted.current) setError(e?.message || "Bulk status update failed");
        return 0;
      }
    },
    [reload],
  );

  const setFeatured = useCallback(
    async (id: string, featured: boolean) => saveAdoptable(id, { featured }),
    [saveAdoptable],
  );

  const moveOrder = useCallback(
    async (id: string, direction: -1 | 1) => {
      const ordered = [...adoptables].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      const index = ordered.findIndex((row) => row.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= ordered.length) return false;

      const reordered = [...ordered];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      const withOrder = reordered.map((row, i) => ({ ...row, sort_order: i }));

      // Persist the whole ordering so the sequence survives a refresh.
      const results = await Promise.all(
        withOrder
          .filter((row) => row.sort_order !== ordered.find((o) => o.id === row.id)?.sort_order)
          .map((row) =>
            fetch(`/api/adoptables/${row.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sort_order: row.sort_order }),
            }),
          ),
      );

      const failed = results.find((res) => !res.ok);
      if (failed) {
        if (mounted.current) setError(await readError(failed, "Failed to reorder"));
        return false;
      }

      setAdoptables(withOrder);
      return true;
    },
    [adoptables],
  );

  const removeAdoptable = useCallback(
    async (id: string) => {
      setBusy(id, true);
      try {
        const res = await fetch(`/api/adoptables/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await readError(res, "Failed to delete adoptable"));
        setAdoptables((prev) => prev.filter((row) => row.id !== id));
        setGallery((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setComparisons((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return true;
      } catch (e: any) {
        if (mounted.current) setError(e?.message || "Failed to delete adoptable");
        return false;
      } finally {
        setBusy(id, false);
      }
    },
    [setBusy],
  );

  const removeBulk = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return false;
      try {
        const res = await fetch("/api/adoptables/bulk", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", ids, confirm: true }),
        });
        if (!res.ok) throw new Error(await readError(res, "Failed to delete adoptables"));
        await reload();
        return true;
      } catch (e: any) {
        if (mounted.current) setError(e?.message || "Failed to delete adoptables");
        return false;
      }
    },
    [reload],
  );

  const deleteEverything = useCallback(async () => {
    try {
      const res = await fetch("/api/adoptables", { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Failed to delete all adoptables"));
      setAdoptables([]);
      setGallery({});
      setComparisons({});
      return true;
    } catch (e: any) {
      if (mounted.current) setError(e?.message || "Failed to delete all adoptables");
      return false;
    }
  }, []);

  /* ----------------------------- Media ----------------------------- */

const uploadMainImage = useCallback(
    async (id: string, file: File) => {
      setBusy(id, true);
      try {
        const uploaded = await uploadMedia(file, "adoptable-main", { adoptableId: id });
        patchLocal(id, { main_image: uploaded.url, main_image_path: uploaded.path });
        // Media changes are persisted immediately, but the draft still differs
        // from the baseline, so the adoptable stays dirty until the owner saves.
        return true;
      } catch (e: any) {
        if (mounted.current) {
          setError(
            e instanceof UploadError
              ? e.message
              : `Main image upload failed: ${e?.message ?? "unknown error"}`,
          );
        }
        return false;
      } finally {
        setBusy(id, false);
      }
    },
    [markDirty, patchLocal, setBusy],
  );

  const removeMainImage = useCallback(
    async (id: string) => {
      setBusy(id, true);
      try {
        const res = await fetch(`/api/adoptables/${id}/main-image`, { method: "DELETE" });
        if (!res.ok) throw new Error(await readError(res, "Failed to remove main image"));
        patchLocal(id, { main_image: null, main_image_path: null });
        return true;
      } catch (e: any) {
        if (mounted.current) setError(e?.message || "Failed to remove main image");
        return false;
      } finally {
        setBusy(id, false);
      }
    },
    [patchLocal, setBusy],
  );

  const uploadGallery = useCallback(
    async (id: string, files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return false;
      setBusy(id, true);

      const startOrder = (gallery[id] ?? []).length;
      const placeholders: GalleryDraft[] = list.map((file, i) => ({
        url: "",
        is_nsfw: isNsfwFilename(file),
        sort_order: startOrder + i,
        pending: true,
        error: isVideo(file) ? "Video files cannot be displayed as gallery artwork." : undefined,
      }));

      setGallery((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), ...placeholders] }));

      let allSucceeded = true;

      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        if (isVideo(file)) {
          allSucceeded = false;
          continue;
        }
        try {
          const uploaded = await uploadMedia(file, "adoptable-gallery", {
            adoptableId: id,
            isNsfw: isNsfwFilename(file),
          });
          setGallery((prev) => ({
            ...prev,
            [id]: (prev[id] ?? []).map((img) =>
              img === placeholders[i]
                ? {
                    id: uploaded.id,
                    url: uploaded.url,
                    path: uploaded.path,
                    is_nsfw: isNsfwFilename(file),
                    sort_order: placeholders[i].sort_order,
                  }
                : img,
            ),
          }));
        } catch (e: any) {
          allSucceeded = false;
          const message =
            e instanceof UploadError ? e.message : `Upload failed: ${e?.message ?? "unknown error"}`;
          setGallery((prev) => ({
            ...prev,
            [id]: (prev[id] ?? []).map((img) =>
              img === placeholders[i] ? { ...img, pending: false, error: message } : img,
            ),
          }));
        }
      }

      setBusy(id, false);
      return allSucceeded;
    },
    [gallery, setBusy],
  );

  const dismissGalleryDraft = useCallback((id: string, draft: GalleryDraft) => {
    setGallery((prev) => ({
      ...prev,
      [id]: (prev[id] ?? []).filter((img) => img !== draft),
    }));
  }, []);

  const setGalleryNsfw = useCallback(
    async (id: string, imageId: string, isNsfw: boolean) => {
      const previous = gallery[id] ?? [];
      setGallery((prev) => ({
        ...prev,
        [id]: previous.map((img) => (img.id === imageId ? { ...img, is_nsfw: isNsfw } : img)),
      }));
      try {
        const res = await fetch(`/api/adoptables/${id}/gallery`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId, isNsfw }),
        });
        if (!res.ok) throw new Error(await readError(res, "Failed to update image"));
        return true;
      } catch (e: any) {
        setGallery((prev) => ({ ...prev, [id]: previous }));
        if (mounted.current) setError(e?.message || "Failed to update image");
        return false;
      }
    },
    [gallery],
  );

  const persistGalleryOrder = useCallback(async (id: string, images: GalleryDraft[]) => {
    const items = images
      .filter((img) => img.id)
      .map((img) => ({ id: img.id!, sort_order: img.sort_order }));
    if (items.length === 0) return true;
    try {
      const res = await fetch(`/api/adoptables/${id}/gallery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error(await readError(res, "Failed to save gallery order"));
      return true;
    } catch (e: any) {
      if (mounted.current) setError(e?.message || "Failed to save gallery order");
      return false;
    }
  }, []);

  const moveGalleryImage = useCallback(
    async (id: string, from: number, to: number) => {
      const current = gallery[id] ?? [];
      if (to < 0 || to >= current.length || from === to) return false;

      const reordered = [...current];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      const withOrder = reordered.map((img, i) => ({ ...img, sort_order: i }));

      setGallery((prev) => ({ ...prev, [id]: withOrder }));

      const ok = await persistGalleryOrder(id, withOrder);
      if (!ok) setGallery((prev) => ({ ...prev, [id]: current }));
      return ok;
    },
    [gallery, persistGalleryOrder],
  );

  const removeGalleryImage = useCallback(
    async (id: string, imageId: string) => {
      const previous = gallery[id] ?? [];
      setBusy(id, true);
      setGallery((prev) => ({ ...prev, [id]: previous.filter((img) => img.id !== imageId) }));
      try {
        const res = await fetch(`/api/adoptables/${id}/gallery?imageId=${imageId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(await readError(res, "Failed to delete image"));
        // Renumber so the remaining order stays contiguous after a removal.
        const remaining = previous
          .filter((img) => img.id !== imageId)
          .map((img, i) => ({ ...img, sort_order: i }));
        setGallery((prev) => ({ ...prev, [id]: remaining }));
        await persistGalleryOrder(id, remaining);
        return true;
      } catch (e: any) {
        setGallery((prev) => ({ ...prev, [id]: previous }));
        if (mounted.current) setError(e?.message || "Failed to delete image");
        return false;
      } finally {
        setBusy(id, false);
      }
    },
    [gallery, persistGalleryOrder, setBusy],
  );

  const uploadComparisonSide = useCallback(
    async (id: string, side: "before" | "after", file: File) => {
      setBusy(id, true);
      const existing = comparisons[id] ?? [];
      const openPair = existing.find((ba) => (side === "before" ? !ba.before_url : !ba.after_url));
      const placeholder: ComparisonDraft = openPair ?? {
        label: "",
        sort_order: existing.length,
        pending: true,
      };

      setComparisons((prev) => {
        const list = prev[id] ?? [];
        return {
          ...prev,
          [id]: openPair ? list : [...list, placeholder],
        };
      });

      try {
        const uploaded = await uploadMedia(
          file,
          side === "before" ? "adoptable-before" : "adoptable-after",
          { adoptableId: id, label: openPair?.label ?? "" },
        );

        setComparisons((prev) => {
          const list = [...(prev[id] ?? [])];
          if (openPair) {
            const index = list.findIndex((ba) => ba.id === openPair.id);
            if (index >= 0) {
              list[index] = {
                ...list[index],
                pending: false,
                [side === "before" ? "before_url" : "after_url"]: uploaded.url,
                [side === "before" ? "before_path" : "after_path"]: uploaded.path,
              };
            }
          } else {
            list.push({
              id: uploaded.id,
              adoptable_id: id,
              before_url: side === "before" ? uploaded.url : null,
              after_url: side === "after" ? uploaded.url : null,
              before_path: side === "before" ? uploaded.path : null,
              after_path: side === "after" ? uploaded.path : null,
              label: "",
              sort_order: list.length,
            });
          }
          return { ...prev, [id]: list };
        });
        return true;
      } catch (e: any) {
        const message =
          e instanceof UploadError ? e.message : `Upload failed: ${e?.message ?? "unknown error"}`;
        setComparisons((prev) => {
          const list = [...(prev[id] ?? [])];
          if (openPair) {
            const index = list.findIndex((ba) => ba.id === openPair.id);
            if (index >= 0) list[index] = { ...list[index], pending: false, error: message };
          } else {
            list.push({ label: "", sort_order: list.length, pending: false, error: message });
          }
          return { ...prev, [id]: list };
        });
        if (mounted.current) setError(message);
        return false;
      } finally {
        setBusy(id, false);
      }
    },
    [comparisons, setBusy],
  );

  const setComparisonLabel = useCallback(
    async (id: string, comparisonId: string, label: string) => {
      setComparisons((prev) => ({
        ...prev,
        [id]: (prev[id] ?? []).map((ba) => (ba.id === comparisonId ? { ...ba, label } : ba)),
      }));
      return true;
    },
    [],
  );

  const removeComparison = useCallback(
    async (id: string, comparisonId: string) => {
      const previous = comparisons[id] ?? [];
      setComparisons((prev) => ({ ...prev, [id]: previous.filter((ba) => ba.id !== comparisonId) }));
      try {
        const res = await fetch(`/api/adoptables/${id}/before-after?id=${comparisonId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(await readError(res, "Failed to delete comparison"));
        return true;
      } catch (e: any) {
        setComparisons((prev) => ({ ...prev, [id]: previous }));
        if (mounted.current) setError(e?.message || "Failed to delete comparison");
        return false;
      }
    },
    [comparisons],
  );

  return useMemo(
    () => ({
      adoptables,
      gallery,
      comparisons,
      loading,
      error,
      dirtyIds,
      busyIds,
      reload,
      markDirty,
      createAdoptable,
      saveAdoptable,
      setStatus,
      setStatusBulk,
      setFeatured,
      moveOrder,
      removeAdoptable,
      removeBulk,
      deleteEverything,
      uploadMainImage,
removeMainImage,
      uploadGallery,
      dismissGalleryDraft,
      setGalleryNsfw,
      moveGalleryImage,
      removeGalleryImage,
      uploadComparisonSide,
      setComparisonLabel,
      removeComparison,
    }),
    [
      adoptables,
      gallery,
      comparisons,
      loading,
      error,
      dirtyIds,
      busyIds,
      reload,
      markDirty,
      createAdoptable,
      saveAdoptable,
      setStatus,
      setStatusBulk,
      setFeatured,
      moveOrder,
      removeAdoptable,
      removeBulk,
      deleteEverything,
      uploadMainImage,
      removeMainImage,
uploadGallery,
      dismissGalleryDraft,
      setGalleryNsfw,
      moveGalleryImage,
      removeGalleryImage,
      uploadComparisonSide,
      setComparisonLabel,
      removeComparison,
    ],
  );
}
