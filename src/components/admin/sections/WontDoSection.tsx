"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardHeader } from "../Card";
import { Button } from "../Button";
import { Input, Select, Textarea } from "../Field";
import { Modal } from "../Modal";
import { useToast } from "../Toast";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { WontDoCategory, WontDoItem } from "@/lib/wont-do/types";
import { itemsForCategory, moveWithin, renumber } from "@/lib/wont-do/tree";

/**
 * Admin editor for the public "What I Won't Do" page.
 *
 * Every action is written straight to the database through the admin-only
 * routes, so nothing is lost when the tab is closed or the page is reloaded.
 * Unpublishing keeps a row in the database and only hides it from visitors.
 */
export function WontDoSection() {
  const [categories, setCategories] = useState<WontDoCategory[]>([]);
  const [items, setItems] = useState<WontDoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    kind: "category" | "item";
    id: string;
    title: string;
  } | null>(null);

  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/wont-do/manage", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load content");
      }
      const data = await res.json();
      setCategories(data.categories ?? []);
      setItems(data.items ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    void load();
  }, [load]);

  async function request(url: string, init: RequestInit): Promise<any> {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Request failed");
    }
    return res.json().catch(() => null);
  }

  /* ----------------------------- categories ----------------------------- */

  async function addCategory() {
    try {
      const body = await request("/api/wont-do/categories", {
        method: "POST",
        body: JSON.stringify({ title: "New category" }),
      });
      setCategories((prev) => [...prev, body.category]);
      toast.success("Category added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add category");
    }
  }

  async function saveCategory(
    id: string,
    patch: Partial<WontDoCategory>,
    message?: string
  ) {
    const previous = categories.find((c) => c.id === id);
    try {
      const body = await request(`/api/wont-do/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      if (body?.category) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? body.category : c))
        );
      }
      if (message) toast.success(message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update category");
      if (previous) {
        setCategories((prev) => prev.map((c) => (c.id === id ? previous : c)));
      }
    }
  }

  async function deleteCategory(id: string) {
    try {
      await request(`/api/wont-do/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setItems((prev) => prev.filter((i) => i.category_id !== id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category");
    }
  }

  /* -------------------------------- items ------------------------------- */

  async function addItem(categoryId: string) {
    try {
      const body = await request("/api/wont-do/items", {
        method: "POST",
        body: JSON.stringify({ category_id: categoryId, title: "New item" }),
      });
      setItems((prev) => [...prev, body.item]);
      toast.success("Item added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add item");
    }
  }

  async function saveItem(
    id: string,
    patch: Partial<WontDoItem>,
    message?: string
  ) {
    const previous = items.find((i) => i.id === id);
    try {
      const body = await request(`/api/wont-do/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      if (body?.item) {
        setItems((prev) => prev.map((i) => (i.id === id ? body.item : i)));
      }
      if (message) toast.success(message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update item");
      if (previous) {
        setItems((prev) => prev.map((i) => (i.id === id ? previous : i)));
      }
    }
  }

  async function deleteItem(id: string) {
    try {
      await request(`/api/wont-do/items/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete item");
    }
  }

  /* ------------------------------ ordering ------------------------------ */

  /** Push the current category/item order to the server. */
  async function persistOrder(
    nextCategories: WontDoCategory[],
    nextItems: WontDoItem[],
    message: string
  ) {
    const categoryIds = nextCategories.map((c) => c.id);
    const ordered: string[] = [];
    for (const id of categoryIds) {
      for (const item of nextItems
        .filter((i) => i.category_id === id)
        .sort((a, b) => a.sort_order - b.sort_order)) {
        ordered.push(item.id);
      }
    }
    for (const item of nextItems) {
      if (!ordered.includes(item.id)) ordered.push(item.id);
    }

    try {
      await request("/api/wont-do/reorder", {
        method: "POST",
        body: JSON.stringify({ categories: categoryIds, items: ordered }),
      });
      toast.success(message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save order");
      void load();
    }
  }

  async function moveCategory(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = renumber(moveWithin(categories, index, target));
    setCategories(next);
    await persistOrder(next, items, "Order saved");
  }

  async function moveItem(categoryId: string, index: number, direction: -1 | 1) {
    const list = itemsForCategory(items, categoryId);
    const target = index + direction;
    if (target < 0 || target >= list.length) return;

    const moved = moveWithin(list, index, target);
    const nextItems = items.map((item) => {
      if (item.category_id !== categoryId) return item;
      const position = moved.findIndex((m) => m.id === item.id);
      return position === -1 ? item : { ...item, sort_order: position };
    });
    setItems(nextItems);
    await persistOrder(categories, nextItems, "Order saved");
  }

  /** Move an item to another category and renumber the affected lists. */
  async function moveItemToCategory(itemId: string, categoryId: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.category_id === categoryId) return;
    const nextItems = items.map((i) =>
      i.id === itemId ? { ...i, category_id: categoryId } : i
    );
    setItems(nextItems);
    await saveItem(itemId, { category_id: categoryId });
    await persistOrder(categories, nextItems, "Item moved");
  }

  /* -------------------------------- render ------------------------------ */

  if (!isSupabaseConfigured) {
    return (
      <Card className="p-8">
        <CardHeader title="What I Won't Do" />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Supabase is not configured. Add credentials to manage this page.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-[var(--accent)]/5 blur-[120px] orb-slow" />

      <Card className="p-8 relative overflow-hidden">
        <CardHeader
          title="What I Won't Do"
          description="Categories and items published on the /wont-do page. Every change is saved immediately. Unpublished items are hidden from visitors but stay in the database."
          actions={
            <Button
              size="sm"
              variant="primary"
              onClick={addCategory}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Category
            </Button>
          }
        />

        {loading && (
          <div className="mt-6 space-y-4" aria-busy="true" aria-label="Loading content">
            {[0, 1].map((i) => (
              <div key={i} className="ad-section-card p-5">
                <div className="h-4 w-40 animate-pulse rounded bg-white/5" />
                <div className="mt-4 h-3 w-full animate-pulse rounded bg-white/5" />
                <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-white/5" />
              </div>
            ))}
          </div>
        )}

        {!loading && loadError && (
          <div className="mt-6 rounded-[var(--r-md)] border border-[var(--danger-border)] bg-[var(--danger-soft)] p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  Could not load this page&apos;s content
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{loadError}</p>
                <Button size="sm" variant="secondary" className="mt-3" onClick={load}>
                  Try again
                </Button>
              </div>
            </div>
          </div>
        )}

        {!loading && !loadError && categories.length === 0 && (
          <div className="mt-6 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] glass py-16 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="mx-auto max-w-md text-lg text-[var(--text-dim)]">
              No categories yet. Add a category to start listing what you will
              not take on.
            </p>
            <Button
              size="sm"
              variant="primary"
              className="mt-5"
              onClick={addCategory}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Category
            </Button>
          </div>
        )}

        {!loading && !loadError && categories.length > 0 && (
          <div className="mt-6 space-y-4">
            {categories.map((category, categoryIndex) => {
              const categoryItems = itemsForCategory(items, category.id);
              return (
                <div key={category.id} className="ad-section-card ad-section-card-hover p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => moveCategory(categoryIndex, -1)}
                        disabled={categoryIndex === 0 || busy}
                        className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-dim)] transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                        aria-label={`Move ${category.title || "category"} up`}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCategory(categoryIndex, 1)}
                        disabled={categoryIndex === categories.length - 1 || busy}
                        className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-dim)] transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                        aria-label={`Move ${category.title || "category"} down`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                      <Input
                        value={category.title}
                        placeholder="Category heading"
                        aria-label="Category heading"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                        }}
                        onChange={(e) =>
                          setCategories((prev) =>
                            prev.map((c) =>
                              c.id === category.id ? { ...c, title: e.target.value } : c
                            )
                          )
                        }
                        onBlur={(e) => {
                          void saveCategory(category.id, { title: e.target.value });
                        }}
                      />
                      <Textarea
                        rows={2}
                        value={category.description}
                        placeholder="Optional short explanation for this category"
                        aria-label="Category description"
                        onChange={(e) =>
                          setCategories((prev) =>
                            prev.map((c) =>
                              c.id === category.id
                                ? { ...c, description: e.target.value }
                                : c
                            )
                          )
                        }
                        onBlur={(e) => {
                          void saveCategory(category.id, {
                            description: e.target.value,
                          });
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDelete({
                          kind: "category",
                          id: category.id,
                          title: category.title || "Untitled category",
                        })
                      }
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--text-dim)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                      aria-label={`Delete ${category.title || "category"}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
                    {categoryItems.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-1 pt-1">
                            <button
                              type="button"
                              onClick={() => moveItem(category.id, itemIndex, -1)}
                              disabled={itemIndex === 0 || busy}
                              className="grid h-6 w-6 place-items-center rounded-md text-[var(--text-dim)] transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                              aria-label={`Move ${item.title || "item"} up`}
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(category.id, itemIndex, 1)}
                              disabled={itemIndex === categoryItems.length - 1 || busy}
                              className="grid h-6 w-6 place-items-center rounded-md text-[var(--text-dim)] transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                              aria-label={`Move ${item.title || "item"} down`}
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="min-w-0 flex-1 space-y-2">
                            <Input
                              value={item.title}
                              placeholder="What you will not do"
                              aria-label="Item"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                              }}
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((i) =>
                                    i.id === item.id ? { ...i, title: e.target.value } : i
                                  )
                                )
                              }
                              onBlur={(e) => {
                                void saveItem(item.id, { title: e.target.value });
                              }}
                            />
                            <Textarea
                              rows={2}
                              value={item.description}
                              placeholder="Optional short explanation"
                              aria-label="Item explanation"
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((i) =>
                                    i.id === item.id
                                      ? { ...i, description: e.target.value }
                                      : i
                                  )
                                )
                              }
                            onBlur={(e) => {
                              void saveItem(item.id, {
                                description: e.target.value,
                              });
                            }}
                            />
                            {categories.length > 1 && (
                              <Select
                                value={item.category_id}
                                aria-label="Item category"
                                onChange={(e) =>
                                  moveItemToCategory(item.id, e.target.value)
                                }
                              >
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.title || "Untitled category"}
                                  </option>
                                ))}
                              </Select>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                saveItem(
                                  item.id,
                                  { visible: !item.visible },
                                  item.visible ? "Item unpublished" : "Item published"
                                )
                              }
                              className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                                item.visible
                                  ? "text-[var(--accent)] bg-[var(--accent-soft)]"
                                  : "text-[var(--text-dim)] hover:bg-white/5"
                              }`}
                              aria-label={
                                item.visible ? "Unpublish item" : "Publish item"
                              }
                              title={
                                item.visible
                                  ? "Published — click to hide from visitors"
                                  : "Unpublished — click to publish"
                              }
                            >
                              {item.visible ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDelete({
                                  kind: "item",
                                  id: item.id,
                                  title: item.title || "Untitled item",
                                })
                              }
                              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-dim)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                              aria-label={`Delete ${item.title || "item"}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => addItem(category.id)}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Delete permanently?"
        description={
          confirmDelete?.kind === "category"
            ? `"${confirmDelete.title}" and every item inside it will be removed from the database. This cannot be undone.`
            : `"${confirmDelete?.title}" will be removed from the database. This cannot be undone.`
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={async () => {
                if (!confirmDelete) return;
                setBusy(true);
                try {
                  if (confirmDelete.kind === "category") {
                    await deleteCategory(confirmDelete.id);
                  } else {
                    await deleteItem(confirmDelete.id);
                  }
                  setConfirmDelete(null);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}


