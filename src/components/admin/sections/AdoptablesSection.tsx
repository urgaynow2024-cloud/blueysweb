"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  LayoutGrid,
  List,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
  EyeOff,
  CheckCircle2,
  Clock3,
  XCircle,
  Sparkles,
  Layers,
  Trash2,
} from "lucide-react";
import type { Adoptable, AdoptableStatus } from "@/types/database";
import { ADOPTABLE_STATUSES, ADOPTABLE_STATUS_META, normalizeStatus } from "@/lib/adoptables/status";
import { categoryLabel, priceSortValue, adoptablePriceSummary } from "@/lib/adoptables/catalog";
import { useToast } from "@/components/admin/Toast";
import { Button } from "@/components/admin/Button";
import { Badge } from "@/components/admin/Badge";
import { AdoptableCard } from "@/components/admin/adoptables/AdoptableCard";
import { StatusControl } from "@/components/admin/adoptables/StatusControl";
import { ConfirmDialog } from "@/components/admin/adoptables/ConfirmDialog";
import { AdoptableEditor } from "@/components/admin/adoptables/AdoptableEditor";
import { Tooltip } from "@/components/admin/adoptables/Tooltip";
import { useAdoptables } from "@/components/admin/adoptables/useAdoptables";

type StatusFilter = AdoptableStatus | "all";
type SortKey = "updated" | "name" | "price" | "status";
type ViewMode = "grid" | "list";

const STATUS_ORDER: AdoptableStatus[] = ["available", "pending", "reserved", "sold", "hidden"];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "updated", label: "Recently Updated" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "status", label: "Status" },
];

const FILTER_ICONS: Record<StatusFilter, typeof Layers> = {
  all: Layers,
  available: CheckCircle2,
  pending: Clock3,
  reserved: Sparkles,
  sold: XCircle,
  hidden: EyeOff,
};

const LIST_COLUMNS = "grid grid-cols-[auto_1fr_auto] items-center gap-4";

export function AdoptablesSection() {
  const controller = useAdoptables();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [view, setView] = useState<ViewMode>("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editorId, setEditorId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Adoptable | null>(null);
  const [pendingDeleteBulkOpen, setPendingDeleteBulkOpen] = useState(false);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [creating, setCreating] = useState(false);

  const { adoptables, gallery, comparisons, loading, error, busyIds } = controller;

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: adoptables.length,
      available: 0,
      pending: 0,
      reserved: 0,
      sold: 0,
      hidden: 0,
    };
    for (const row of adoptables) {
      result[normalizeStatus(row.availability)] += 1;
    }
    return result;
  }, [adoptables]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = adoptables.filter((row) => {
      if (statusFilter !== "all" && normalizeStatus(row.availability) !== statusFilter) return false;
      if (!needle) return true;
      return (
        (row.title ?? "").toLowerCase().includes(needle) ||
        (row.description ?? "").toLowerCase().includes(needle) ||
        (row.species ?? "").toLowerCase().includes(needle) ||
        categoryLabel(row.category).toLowerCase().includes(needle) ||
        (row.category ?? "").toLowerCase().includes(needle)
      );
    });

    return matched.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return (a.title ?? "").localeCompare(b.title ?? "", undefined, { sensitivity: "base" });
        case "price": {
          const diff = priceSortValue(a) - priceSortValue(b);
          return Number.isFinite(diff) ? diff : priceSortValue(a) === priceSortValue(b) ? 0 : 1;
        }
        case "status":
          return (
            STATUS_ORDER.indexOf(normalizeStatus(a.availability)) -
            STATUS_ORDER.indexOf(normalizeStatus(b.availability))
          );
        case "updated":
        default: {
          const at = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          const bt = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          return bt - at;
        }
      }
    });
  }, [adoptables, query, statusFilter, sortKey]);

  const editorAdoptable = useMemo(
    () => adoptables.find((row) => row.id === editorId) ?? null,
    [adoptables, editorId],
  );

  // A selection that points at rows no longer visible is meaningless.
  useEffect(() => {
    setSelected((prev) => {
      if (prev.size === 0) return prev;
      const visible = new Set(filtered.map((row) => row.id));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [filtered]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    try {
      const id = await controller.createAdoptable();
      if (id) {
        toast.success("Adoptable created — add artwork and pricing to publish it");
        setEditorId(id);
      } else {
        toast.error("Could not create the adoptable. Check your session and try again.");
      }
    } finally {
      setCreating(false);
    }
  }, [controller, toast]);

  const handleStatus = useCallback(
    async (id: string, status: AdoptableStatus) => {
      const name = adoptables.find((row) => row.id === id)?.title || "Adoptable";
      const ok = await controller.setStatus(id, status);
      if (ok) {
        toast.success(`${name} is now ${ADOPTABLE_STATUS_META[status].title.toLowerCase()}`);
      } else {
        toast.error(`Could not update ${name}. The previous status was restored.`);
      }
    },
    [adoptables, controller, toast],
  );

  const handleToggleVisibility = useCallback(
    async (id: string) => {
      const row = adoptables.find((item) => item.id === id);
      if (!row) return;
      await handleStatus(id, normalizeStatus(row.availability) === "hidden" ? "available" : "hidden");
    },
    [adoptables, handleStatus],
  );

  const handleFeatured = useCallback(
    async (id: string, featured: boolean) => {
      const ok = await controller.setFeatured(id, featured);
      if (ok) toast.success(featured ? "Marked as featured" : "Removed from featured");
      else toast.error("Could not update the featured flag");
    },
    [controller, toast],
  );

  const handleMove = useCallback(
    async (id: string, direction: -1 | 1) => {
      const ok = await controller.moveOrder(id, direction);
      if (!ok) toast.error("Could not change the display order");
    },
    [controller, toast],
  );

  const runBulkStatus = useCallback(
    async (status: AdoptableStatus) => {
      const ids = [...selected];
      if (ids.length === 0) return;
      setBulkBusy(true);
      const updated = await controller.setStatusBulk(ids, status);
      setBulkBusy(false);
      if (updated > 0) {
        toast.success(
          `${updated} adoptable${updated === 1 ? "" : "s"} marked ${ADOPTABLE_STATUS_META[status].title.toLowerCase()}`,
        );
        setSelected(new Set());
      } else {
        toast.error("Bulk status update failed. Nothing was changed.");
      }
    },
    [controller, selected, toast],
  );

  const runBulkDelete = useCallback(async () => {
    const ids = [...selected];
    setPendingDeleteBulkOpen(false);
    if (ids.length === 0) return;
    setBulkBusy(true);
    const ok = await controller.removeBulk(ids);
    setBulkBusy(false);
    if (ok) {
      toast.success(`${ids.length} adoptable${ids.length === 1 ? "" : "s"} deleted permanently`);
      setSelected(new Set());
    } else {
      toast.error("Bulk delete failed. Nothing was removed.");
    }
  }, [controller, selected, toast]);

  const handleDeleteOne = useCallback(async () => {
    const target = pendingDelete;
    setPendingDelete(null);
    if (!target) return;
    const ok = await controller.removeAdoptable(target.id);
    if (ok) toast.success(`${target.title || "Adoptable"} deleted permanently`);
    else toast.error("Delete failed. The adoptable was not removed.");
  }, [controller, pendingDelete, toast]);

  const handleDeleteAll = useCallback(async () => {
    setConfirmingAll(false);
    const ok = await controller.deleteEverything();
    if (ok) {
      toast.success("All adoptables were deleted");
      setSelected(new Set());
    } else {
      toast.error("Could not delete all adoptables");
    }
  }, [controller, toast]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((row) => selected.has(row.id));

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const row of filtered) next.delete(row.id);
      } else {
        for (const row of filtered) next.add(row.id);
      }
      return next;
    });
  }, [allVisibleSelected, filtered]);

  const orderedForMove = useMemo(
    () => [...adoptables].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [adoptables],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="ad-section-card glow-border p-6">
          <div className="skeleton h-6 w-40 rounded" />
          <div className="skeleton mt-3 h-4 w-72 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="ad-section-card overflow-hidden">
              <div className="skeleton aspect-[4/5] w-full" />
              <div className="space-y-3 p-4">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-3 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasAdoptables = adoptables.length > 0;

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------------- Header */}
      <div className="ad-section-card glow-border relative overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full bg-[var(--accent)]/5 blur-[120px] orb-slow" aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Content
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.02em] text-white">
              Adoptables
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-[var(--text-secondary)]">
              Manage your characters, availability, pricing and listings from one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip label="Reload from the database">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void controller.reload()}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                aria-label="Reload adoptables"
              >
                Refresh
              </Button>
            </Tooltip>
            <Button
              variant="primary"
              size="sm"
              loading={creating}
              onClick={handleCreate}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Adoptable
            </Button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="relative mt-4 flex items-start gap-3 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">Something went wrong</p>
              <p className="mt-0.5 break-words text-xs text-[var(--text-secondary)]">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void controller.reload()}
              className="shrink-0 text-[11px] font-semibold text-white underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------ Search + filters */}
      <div className="ad-section-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search adoptables…"
              aria-label="Search adoptables by name, description or category"
              className="field pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-[var(--text-dim)] transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="adoptable-sort">
              Sort adoptables
            </label>
            <select
              id="adoptable-sort"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="field w-auto appearance-none bg-[var(--bg-elevated)] pr-8 text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-1">
              <Tooltip label="Card view">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  aria-label="Card view"
                  aria-pressed={view === "grid"}
                  className={`grid h-7 w-7 place-items-center rounded-lg transition-colors ${
                    view === "grid" ? "bg-white/10 text-white" : "text-[var(--text-dim)] hover:text-white"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden />
                </button>
              </Tooltip>
              <Tooltip label="List view">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  className={`grid h-7 w-7 place-items-center rounded-lg transition-colors ${
                    view === "list" ? "bg-white/10 text-white" : "text-[var(--text-dim)] hover:text-white"
                  }`}
                >
                  <List className="h-4 w-4" aria-hidden />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Status filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["all", ...ADOPTABLE_STATUSES] as StatusFilter[]).map((filter) => {
            const Icon = FILTER_ICONS[filter];
            const isActive = statusFilter === filter;
            const meta = filter === "all" ? null : ADOPTABLE_STATUS_META[filter];
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-white"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "" : meta ? meta.text : ""}`} aria-hidden />
                {filter === "all" ? "All" : ADOPTABLE_STATUS_META[filter].title}
                <span className="rounded-full bg-black/25 px-1.5 py-px text-[10px] tabular-nums">
                  {counts[filter]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------- Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky top-3 z-30 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--accent)]/40 bg-[var(--bg-elevated)]/95 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur">
          <span className="text-sm font-medium text-white">
            {selected.size} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              loading={bulkBusy}
              onClick={() => void runBulkStatus("available")}
            >
              Mark Available
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={bulkBusy}
              onClick={() => void runBulkStatus("reserved")}
            >
              Reserve
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={bulkBusy}
              onClick={() => void runBulkStatus("sold")}
            >
              Mark Sold
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={bulkBusy}
              onClick={() => void runBulkStatus("hidden")}
              leftIcon={<EyeOff className="h-3.5 w-3.5" />}
            >
              Hide
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={bulkBusy}
              onClick={() => setPendingDeleteBulkOpen(true)}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Delete…
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs font-medium text-[var(--text-secondary)] underline underline-offset-2 transition-colors hover:text-white"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- Listing */}
      {!hasAdoptables ? (
        <div className="ad-section-card flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Package className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-white">No adoptables yet</h2>
          <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
            Create your first adoptable to start building the public gallery. It stays hidden from
            visitors until you give it artwork, pricing and an Available status.
          </p>
          <Button
            variant="primary"
            className="mt-6"
            loading={creating}
            onClick={handleCreate}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Adoptable
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ad-section-card flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] text-[var(--text-dim)]">
            <Search className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="text-base font-semibold text-white">No adoptables match</h2>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
            {query
              ? `Nothing matches “${query}” with the current status filter.`
              : "There are no adoptables with this status yet."}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-5"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
            }}
            leftIcon={<X className="h-4 w-4" />}
          >
            Reset filters
          </Button>
        </div>
      ) : view === "grid" ? (
        <>
          <div className="flex items-center justify-between gap-3 px-1">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              Select all {filtered.length} shown
            </label>
            <span className="text-xs text-[var(--text-dim)]">
              {filtered.length} of {adoptables.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((row) => {
              const index = orderedForMove.findIndex((item) => item.id === row.id);
              return (
                <AdoptableCard
                  key={row.id}
                  adoptable={row}
                  gallery={gallery[row.id] ?? []}
                  comparisons={comparisons[row.id] ?? []}
                  busy={busyIds.has(row.id)}
                  dirty={controller.dirtyIds.has(row.id)}
                  selected={selected.has(row.id)}
                  onToggleSelect={toggleSelect}
                  onEdit={(target) => setEditorId(target.id)}
                  onStatusChange={(id, status) => void handleStatus(id, status)}
                  onToggleFeatured={(id, featured) => void handleFeatured(id, featured)}
                  onToggleVisibility={(id) => void handleToggleVisibility(id)}
                  onMove={(id, direction) => void handleMove(id, direction)}
                  onDelete={(target) => setPendingDelete(target)}
                  canMoveUp={index > 0}
                  canMoveDown={index >= 0 && index < orderedForMove.length - 1}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className="ad-section-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              Select all shown
            </label>
            <span className="text-xs text-[var(--text-dim)]">
              {filtered.length} of {adoptables.length}
            </span>
          </div>

          <ul className="divide-y divide-[var(--border)]">
            {filtered.map((row) => {
              const status = normalizeStatus(row.availability);
              const meta = ADOPTABLE_STATUS_META[status];
              return (
                <li key={row.id} className={`${LIST_COLUMNS} px-4 py-3 transition-colors hover:bg-white/[0.03]`}>
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    aria-label={`Select ${row.title || "untitled adoptable"}`}
                    className="h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate text-sm font-semibold text-white">
                        {row.title || "Untitled adoptable"}
                      </span>
                      {row.featured && <Badge tone="accent">Featured</Badge>}
                      <span className="text-[11px] uppercase tracking-wider text-[var(--text-dim)]">
                        {categoryLabel(row.category)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                      {adoptablePriceSummary(row, true)}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <span className={`hidden text-xs font-semibold sm:inline ${meta.text}`}>
                      {meta.label}
                    </span>
                    <StatusControl
                      value={status}
                      onChange={(next) => void handleStatus(row.id, next)}
                      name={row.title || "this adoptable"}
                      busy={busyIds.has(row.id)}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditorId(row.id)}
                    >
                      Edit
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ------------------------------------------------------------ Danger zone */}
      {hasAdoptables && (
        <div className="ad-section-card border-[var(--danger-border)]/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <AlertTriangle className="h-4 w-4 text-[var(--danger)]" aria-hidden />
                Danger zone
              </h2>
              <p className="mt-1 max-w-lg text-xs leading-relaxed text-[var(--text-secondary)]">
                To take an adoptable off the public site without losing anything, set its status to{" "}
                <strong className="text-white">Hidden</strong>. Deletion is permanent and removes
                the images, description, pricing and gallery with it.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmingAll(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete all adoptables…
            </Button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------- Dialogs */}
      <AdoptableEditor
        open={editorId !== null}
        adoptable={editorAdoptable}
        controller={controller}
        onClose={() => setEditorId(null)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDeleteOne}
        title={`Delete “${pendingDelete?.title || "Untitled adoptable"}”?`}
        description="This is permanent. It cannot be undone."
        confirmLabel="Delete permanently"
        requireTypedText={pendingDelete ? pendingDelete.title?.trim() || "untitled" : ""}
        busy={pendingDelete ? busyIds.has(pendingDelete.id) : false}
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Everything attached to this adoptable is destroyed, including its main image, gallery,
          before/after comparisons, description, pricing and character details.
        </p>
        <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-xs text-[var(--text-secondary)]">
          <strong className="text-white">Prefer not to?</strong> Set the status to{" "}
          <strong className="text-white">Hidden</strong> instead. The adoptable keeps all of its
          media and can be brought back at any time.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={pendingDeleteBulkOpen}
        onCancel={() => setPendingDeleteBulkOpen(false)}
        onConfirm={runBulkDelete}
        title={`Delete ${selected.size} adoptable${selected.size === 1 ? "" : "s"}?`}
        description="This is permanent. It cannot be undone."
        confirmLabel={`Delete ${selected.size} permanently`}
        requireTypedText={`delete ${selected.size}`}
        busy={bulkBusy}
      >
        <p className="text-sm text-[var(--text-secondary)]">
          All images, descriptions, pricing and galleries for the selected adoptables will be
          destroyed.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmingAll}
        onCancel={() => setConfirmingAll(false)}
        onConfirm={handleDeleteAll}
        title="Delete every adoptable?"
        description="This clears the whole collection. It cannot be undone."
        confirmLabel="Delete everything"
        requireTypedText="delete all adoptables"
      >
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <p>
            This permanently removes all {counts.all} adoptables along with their images, gallery
            entries and before/after comparisons.
          </p>
          <p className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-xs text-white">
            There is no undo. Consider setting the status to <strong>Hidden</strong> instead, which
            keeps everything and only removes the listings from the public site.
          </p>
        </div>
      </ConfirmDialog>
    </div>
  );
}
