"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import {
  AlignLeft,
  CircleAlert,
  Images,
  Loader2,
  Rocket,
  Save,
  Settings2,
  SlidersHorizontal,
  Tag,
  Type,
  X,
} from "lucide-react";
import type { Adoptable, AdoptableStatus } from "@/types/database";
import { normalizeStatus, visibleForStatus } from "@/lib/adoptables/status";
import { normalizeCategory } from "@/lib/adoptables/catalog";
import { Button } from "@/components/admin/Button";
import { useToast } from "@/components/admin/Toast";
import { OverviewPanel } from "./OverviewPanel";
import { MediaPanel } from "./MediaPanel";
import { PricingPanel, buildPricingPatch } from "./PricingPanel";
import { DescriptionPanel } from "./DescriptionPanel";
import { DetailsPanel } from "./DetailsPanel";
import { PublishingPanel } from "./PublishingPanel";
import { AdvancedPanel } from "./AdvancedPanel";
import { ConfirmDialog } from "./ConfirmDialog";
import type { AdoptablesController } from "./useAdoptables";

export interface AdoptableEditorProps {
  open: boolean;
  /** Null while the drawer is closed. */
  adoptable: Adoptable | null;
  controller: AdoptablesController;
  onClose: () => void;
}

type TabId = "overview" | "media" | "pricing" | "description" | "details" | "publishing" | "advanced";

interface TabConfig {
  id: TabId;
  label: string;
  icon: typeof Type;
  /** Draft columns owned by the tab; Media owns none because it saves on click. */
  fields: readonly (keyof Adoptable)[];
}

// `description` is owned solely by the Description tab. Overview only previews
// it, because two inputs bound to one column overwrite each other.
const OVERVIEW_FIELDS: readonly (keyof Adoptable)[] = ["title", "category", "featured"];
const PRICING_FIELDS: readonly (keyof Adoptable)[] = [
  "price",
  "sfw_available",
  "sfw_price",
  "sfw_price_usd",
  "nsfw_available",
  "nsfw_price",
  "nsfw_price_usd",
  "bundle_available",
  "bundle_price",
  "bundle_price_usd",
];
const DESCRIPTION_FIELDS: readonly (keyof Adoptable)[] = ["description"];
const DETAILS_FIELDS: readonly (keyof Adoptable)[] = ["species", "included_items", "vrchat_info", "rules_license"];
const PUBLISHING_FIELDS: readonly (keyof Adoptable)[] = ["featured"];
const ADVANCED_FIELDS: readonly (keyof Adoptable)[] = ["sort_order"];

const TABS: readonly TabConfig[] = [
  { id: "overview", label: "Overview", icon: Type, fields: OVERVIEW_FIELDS },
  { id: "media", label: "Media", icon: Images, fields: [] },
  { id: "pricing", label: "Pricing", icon: Tag, fields: PRICING_FIELDS },
  { id: "description", label: "Description", icon: AlignLeft, fields: DESCRIPTION_FIELDS },
  { id: "details", label: "Details", icon: SlidersHorizontal, fields: DETAILS_FIELDS },
  { id: "publishing", label: "Publishing", icon: Rocket, fields: PUBLISHING_FIELDS },
  { id: "advanced", label: "Advanced", icon: Settings2, fields: ADVANCED_FIELDS },
];

const DRAFT_FIELDS: readonly (keyof Adoptable)[] = Array.from(
  new Set<keyof Adoptable>([
    ...OVERVIEW_FIELDS,
    ...DESCRIPTION_FIELDS,
    ...PRICING_FIELDS,
    ...DETAILS_FIELDS,
    ...ADVANCED_FIELDS,
    "main_image",
  ]),
);

/**
 * Loose equality for draft comparison.
 *
 * The database stores empty free-text as NULL and booleans as false, so "unset"
 * arrives in several shapes. Comparing them as strings keeps the changed dot and
 * the unsaved-changes warning from firing on a value that is merely formatted
 * differently.
 */
function sameValue(a: unknown, b: unknown): boolean {
  if (typeof a === "boolean" || typeof b === "boolean") return Boolean(a) === Boolean(b);
  if (typeof a === "number" || typeof b === "number") {
    return (Number(a) || 0) === (Number(b) || 0);
  }
  return String(a ?? "").trim() === String(b ?? "").trim();
}

function isDirtyFor(fields: readonly (keyof Adoptable)[], draft: Adoptable, baseline: Adoptable): boolean {
  if (!draft || !baseline) return false;
  return fields.some((field) => {
    if (field === "category") {
      return normalizeCategory(draft.category) !== normalizeCategory(baseline.category);
    }
    if (field === "main_image") {
      const a = (draft as any).main_image;
      const b = (baseline as any).main_image;
      if (a === b) return false;
      if (!a && !b) return false;
      if (typeof a === "string" && typeof b === "string") return a.trim() !== b.trim();
      if (typeof a === "object" && typeof b === "object") {
        return JSON.stringify(a) !== JSON.stringify(b);
      }
      return true;
    }
    return !sameValue(draft[field], baseline[field]);
  });
}

export function AdoptableEditor({ open, adoptable, controller, onClose }: AdoptableEditorProps): ReactElement | null {
  const toast = useToast();
  const [draft, setDraft] = useState<Adoptable | null>(null);
  const [baseline, setBaseline] = useState<Adoptable | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadedId = useRef<string | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const prevLiveMainImage = useRef<string | null>(null);
  const prevLiveMainImagePath = useRef<string | null>(null);

  const id = adoptable?.id ?? null;
  const busy = id ? controller.busyIds.has(id) : false;

  /* Re-seed the draft only when the drawer opens or the record changes. The
     controller mutates the shared record optimistically on every media action,
     so re-seeding on each prop identity change would destroy unsaved edits. */
  useEffect(() => {
    if (!open || !adoptable) {
      loadedId.current = null;
      setDraft(null);
      setBaseline(null);
      prevLiveMainImage.current = null;
      prevLiveMainImagePath.current = null;
      return;
    }
    if (loadedId.current === adoptable.id) return;
    loadedId.current = adoptable.id;
    setDraft(adoptable);
    setBaseline(adoptable);
    setTab("overview");
    setConfirmingDiscard(false);
  }, [open, adoptable]);

  /* Sync media fields from the controller's live record to draft/baseline.
     Media uploads (main image, gallery) persist immediately via the controller
     and update the shared adoptable record. Without this sync, the editor's
     draft/baseline would stay stale and the dirty check would miss media changes. */
  useEffect(() => {
    if (!id || !draft || !baseline) return;
    const live = controller.adoptables.find((row) => row.id === id);
    if (!live) return;

    const mainImage = live.main_image ?? null;
    const mainImagePath = live.main_image_path ?? null;

    if (mainImage !== prevLiveMainImage.current || mainImagePath !== prevLiveMainImagePath.current) {
      prevLiveMainImage.current = mainImage;
      prevLiveMainImagePath.current = mainImagePath;
      setDraft((prev) => (prev ? { ...prev, main_image: mainImage, main_image_path: mainImagePath } : prev));
      setBaseline((prev) => (prev ? { ...prev, main_image: mainImage, main_image_path: mainImagePath } : prev));
    }
  }, [id, draft, baseline, controller.adoptables]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const dirty = Boolean(draft && baseline && isDirtyFor(DRAFT_FIELDS, draft, baseline));

  // markDirty lives in a ref because the controller object is rebuilt on every
  // dirtyIds change, so depending on it directly would re-run this effect in a
  // loop: markDirty creates a new Set, which changes the controller identity.
  const markDirtyRef = useRef(controller.markDirty);
  markDirtyRef.current = controller.markDirty;

  useEffect(() => {
    if (!id) return;
    markDirtyRef.current(id, dirty);
  }, [dirty, id]);

  const patch = useCallback((changes: Partial<Adoptable>) => {
    setDraft((prev) => (prev ? { ...prev, ...changes } : prev));
  }, []);

  const commitImmediate = useCallback((changes: Partial<Adoptable>) => {
    setDraft((prev) => (prev ? { ...prev, ...changes } : prev));
    setBaseline((prev) => (prev ? { ...prev, ...changes } : prev));
  }, []);

  const requestClose = useCallback(() => {
    if (busy || saving) return;
    if (dirty) {
      setConfirmingDiscard(true);
      return;
    }
    onClose();
  }, [busy, dirty, onClose, saving]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // A nested ConfirmDialog renders a Modal that handles Escape itself.
      // Without this guard one keypress would both dismiss the dialog and start
      // closing the drawer behind it.
      if (document.querySelector(".ad-modal-backdrop")) return;
      requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, requestClose]);

  const handleStatusChange = useCallback(
    async (next: AdoptableStatus) => {
      if (!id || !draft) return;
      const name = draft.title?.trim() || "this adoptable";
      const ok = await controller.setStatus(id, next);
      if (!ok) {
        toast.error(`Could not update the status of ${name}. The previous status was restored.`);
        return;
      }
      const status = normalizeStatus(next);
      commitImmediate({ availability: status, visible: visibleForStatus(status) });
      toast.success(`${name} is now ${status === "hidden" ? "hidden" : status}`);
    },
    [commitImmediate, controller, draft, id, toast],
  );

  const handleSave = useCallback(async () => {
    if (!id || !draft || !baseline) return;
    const changes: Partial<Adoptable> = {};
    for (const field of DRAFT_FIELDS) {
      const next = draft[field];
      const current = baseline[field];
      const differs =
        field === "category"
          ? normalizeCategory(draft.category) !== normalizeCategory(baseline.category)
          : !sameValue(next, current);
      if (differs) (changes as Record<string, unknown>)[field] = next;
    }
    // Pricing is always written in full so a tier that was switched off has its
    // stored price cleared rather than left behind as a hidden stale value.
    Object.assign(changes, buildPricingPatch(draft));

    if (Object.keys(changes).length === 0) {
      toast.info("There is nothing to save.");
      return;
    }

    setSaving(true);
    const ok = await controller.saveAdoptable(id, changes);
    setSaving(false);

    if (!ok) {
      toast.error(
        `Could not save ${draft.title?.trim() || "this adoptable"}. Your changes are still here — fix the problem and try again.`,
      );
      return;
    }

    const saved = { ...draft, ...changes, availability: normalizeStatus(draft.availability) };
    setDraft(saved);
    setBaseline(saved);
    toast.success(`${saved.title?.trim() || "Adoptable"} saved`);
  }, [baseline, controller, draft, id, toast]);

  const dirtyTabs = useMemo(() => {
    const map = new Map<TabId, boolean>();
    if (!draft || !baseline) {
      for (const entry of TABS) map.set(entry.id, false);
      return map;
    }
    for (const entry of TABS) map.set(entry.id, isDirtyFor(entry.fields, draft, baseline));
    return map;
  }, [baseline, draft]);

  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((entry) => entry.id === tab);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    const target = TABS[next];
    setTab(target.id);
    tabRefs.current[target.id]?.focus();
  };

  if (!open || !adoptable || !draft || !baseline) return null;

  const name = draft.title?.trim() || "Untitled adoptable";
  const activeTab = TABS.find((entry) => entry.id === tab) ?? TABS[0];

  // Media writes straight through the controller, so the main image lives on the
  // controller's record rather than in the draft. Reading the draft here would
  // show the previous image until the drawer is reopened.
  const live = controller.adoptables.find((row) => row.id === draft.id);

  return (
    <div
      className="ad-drawer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="adoptable-editor-title"
        className="ad-drawer-panel glow-border"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <h2 id="adoptable-editor-title" className="truncate text-base font-semibold text-white">
              {name}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-dim)]">
              {dirty ? "Unsaved changes" : "All changes saved"}
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={busy || saving}
            aria-label="Close editor"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--text-dim)] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div
          role="tablist"
          aria-label="Editor sections"
          onKeyDown={onTabKeyDown}
          className="ad-drawer-tabs shrink-0"
        >
          {TABS.map((entry) => {
            const selected = entry.id === tab;
            const Icon = entry.icon;
            const changed = dirtyTabs.get(entry.id) ?? false;
            return (
              <button
                key={entry.id}
                ref={(node) => {
                  tabRefs.current[entry.id] = node;
                }}
                type="button"
                role="tab"
                id={`adoptable-tab-${entry.id}`}
                aria-selected={selected}
                aria-controls={`adoptable-panel-${entry.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(entry.id)}
                className={`ad-drawer-tab ${
                  selected ? "text-white" : "text-[var(--text-secondary)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {entry.label}
                {changed && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-amber-400"
                    aria-label="Unsaved changes in this section"
                    role="img"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="ad-drawer-body">
          {controller.error && (
            <p
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-3 py-2.5 text-xs leading-snug text-[var(--danger)]"
            >
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{controller.error}</span>
            </p>
          )}

          <div
            role="tabpanel"
            id={`adoptable-panel-${activeTab.id}`}
            aria-labelledby={`adoptable-tab-${activeTab.id}`}
            tabIndex={0}
            className="ad-drawer-content outline-none"
          >
            {activeTab.id === "overview" && (
              <OverviewPanel
                value={draft}
                onChange={patch}
                status={normalizeStatus(draft.availability)}
                statusBusy={busy}
                onStatusChange={(next) => void handleStatusChange(next)}
                onEditDescription={() => setTab("description")}
              />
            )}

            {activeTab.id === "media" && (
              <MediaPanel
                value={live ?? draft}
                gallery={controller.gallery[draft.id] ?? []}
                comparisons={controller.comparisons[draft.id] ?? []}
                controller={controller}
              />
            )}

            {activeTab.id === "pricing" && <PricingPanel value={draft} onChange={patch} />}

            {activeTab.id === "description" && (
              <DescriptionPanel
                value={draft.description ?? ""}
                onChange={(next) => patch({ description: next })}
              />
            )}

            {activeTab.id === "details" && <DetailsPanel value={draft} onChange={patch} />}

            {activeTab.id === "publishing" && (
              <PublishingPanel
                value={draft}
                onChange={patch}
                status={normalizeStatus(draft.availability)}
                statusBusy={busy}
                onStatusChange={(next) => void handleStatusChange(next)}
              />
            )}

            {activeTab.id === "advanced" && (
              <AdvancedPanel
                value={draft}
                onChange={patch}
                controller={controller}
                statusBusy={busy}
                onStatusChange={(next) => void handleStatusChange(next)}
                onOrderPersisted={(sortOrder) => commitImmediate({ sort_order: sortOrder })}
                onDeleted={onClose}
              />
            )}
          </div>
        </div>

        <div className="ad-drawer-footer flex-col sm:flex-row">
          <p className="mr-auto text-xs text-[var(--text-dim)]" aria-live="polite">
            {busy || saving ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                {saving ? "Saving changes…" : "Working…"}
              </span>
            ) : dirty ? (
              "You have unsaved changes in this editor."
            ) : (
              "Nothing to save."
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={requestClose} disabled={busy || saving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleSave()}
              loading={saving}
              disabled={busy || !dirty}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDiscard}
        onCancel={() => setConfirmingDiscard(false)}
        onConfirm={() => {
          setConfirmingDiscard(false);
          if (id) controller.markDirty(id, false);
          onClose();
        }}
        title="Discard unsaved changes?"
        description={`Your edits to ${name} will be lost.`}
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        variant="danger"
      >
        <p className="text-sm text-[var(--text-secondary)]">
          This editor has changes that have not been saved. Closing now discards them permanently.
          Media you have already uploaded is unaffected.
        </p>
      </ConfirmDialog>
    </div>
  );
}