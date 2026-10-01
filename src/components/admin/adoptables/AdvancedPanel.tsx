"use client";

import { useState, type ReactElement } from "react";
import { ArrowDown, ArrowUp, EyeOff, Info, TriangleAlert, Trash2 } from "lucide-react";
import type { Adoptable, AdoptableStatus } from "@/types/database";
import { normalizeStatus } from "@/lib/adoptables/status";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Field";
import { useToast } from "@/components/admin/Toast";
import { Tooltip } from "./Tooltip";
import { ConfirmDialog } from "./ConfirmDialog";
import type { AdoptablesController } from "./useAdoptables";

export interface AdvancedPanelProps {
  value: Adoptable;
  onChange: (patch: Partial<Adoptable>) => void;
  controller: AdoptablesController;
  statusBusy: boolean;
  onStatusChange: (status: AdoptableStatus) => void;
  /** Called after `moveOrder` persisted, so the editor can rebase its draft. */
  onOrderPersisted: (sortOrder: number) => void;
  /** Called after a successful permanent delete. */
  onDeleted: () => void;
}

/**
 * Ordering and per-adoptable danger zone.
 *
 * Ordering is deliberately split: the arrow buttons persist immediately through
 * the controller (reordering must survive a refresh even if the rest of the
 * draft is abandoned), while the numeric field is part of the draft so a hand
 * typed position is only applied on an explicit Save.
 */
export function AdvancedPanel({
  value,
  onChange,
  controller,
  statusBusy,
  onStatusChange,
  onOrderPersisted,
  onDeleted,
}: AdvancedPanelProps): ReactElement {
  const toast = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [moving, setMoving] = useState(false);

  const id = value.id;
  const busy = controller.busyIds.has(id);
  const status = normalizeStatus(value.availability);
  const isHidden = status === "hidden";
  const name = value.title?.trim() || "untitled";
  const displayName = value.title?.trim() || "Untitled adoptable";

  const move = async (direction: -1 | 1) => {
    // moveOrder renumbers the whole list, so the new position is derived from the
    // pre-move snapshot; the controller's own array is still the stale one here.
    const ordered = [...controller.adoptables].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const nextPosition = ordered.findIndex((row) => row.id === id) + direction;

    setMoving(true);
    const ok = await controller.moveOrder(id, direction);
    setMoving(false);
    if (!ok) {
      toast.error("Could not change the order. It may already be at the end of the list.");
      return;
    }
    onOrderPersisted(nextPosition >= 0 ? nextPosition : (value.sort_order ?? 0));
    toast.success(direction === -1 ? "Moved earlier" : "Moved later");
  };

  const runDelete = async () => {
    setDeleting(true);
    const ok = await controller.removeAdoptable(id);
    setDeleting(false);
    if (!ok) {
      toast.error(`Could not delete ${displayName}. Nothing was removed.`);
      return;
    }
    setConfirmingDelete(false);
    toast.success(`${displayName} was permanently deleted`);
    onDeleted();
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------- Order */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Order</h3>
        <p className="text-xs leading-snug text-[var(--text-dim)]">
          Lower numbers appear first on the public listing. The arrow buttons save immediately and
          renumber the whole list; the numeric field is applied when you save the rest of this
          draft.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <label className="w-32">
            <span className="ad-label">Position</span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={value.sort_order ?? 0}
              onChange={(event) => {
                const parsed = Number(event.target.value);
                onChange({ sort_order: Number.isFinite(parsed) ? Math.trunc(parsed) : 0 });
              }}
              aria-describedby="sort-order-hint"
            />
          </label>

          <div className="flex items-center gap-2 pb-0.5">
            <Tooltip label="Move earlier and save">
              <Button
                variant="secondary"
                size="sm"
                disabled={busy || moving}
                leftIcon={<ArrowUp className="h-3.5 w-3.5" />}
                onClick={() => void move(-1)}
              >
                Up
              </Button>
            </Tooltip>
            <Tooltip label="Move later and save">
              <Button
                variant="secondary"
                size="sm"
                disabled={busy || moving}
                leftIcon={<ArrowDown className="h-3.5 w-3.5" />}
                onClick={() => void move(1)}
              >
                Down
              </Button>
            </Tooltip>
          </div>
        </div>
        <p id="sort-order-hint" className="text-xs text-[var(--text-dim)]">
          Currently position {(value.sort_order ?? 0) + 1} in the listing.
        </p>
      </section>

      {/* ---------------------------------- Danger zone */}
      <section className="space-y-3 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden />
          Danger zone
        </h3>

        <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Hide from public site</p>
              <p className="mt-0.5 text-xs leading-snug text-[var(--text-dim)]">
                Keeps the record, its images, description, pricing and gallery, and removes the
                listing from the public site. This is the safe alternative to deleting.
              </p>
            </div>
            {isHidden ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={busy || statusBusy}
                onClick={() => onStatusChange("available")}
              >
                Return to public site
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                disabled={busy || statusBusy}
                leftIcon={<EyeOff className="h-3.5 w-3.5" />}
                onClick={() => onStatusChange("hidden")}
              >
                Hide
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3 border-t border-[var(--border)] pt-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Delete permanently</p>
              <p className="mt-0.5 text-xs leading-snug text-[var(--text-dim)]">
                Destroys the images, description, pricing and gallery. There is no undo and no
                recovery from the admin panel.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              disabled={busy || deleting}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={() => setConfirmingDelete(true)}
            >
              Delete…
            </Button>
          </div>
        </div>

        <p className="flex items-start gap-2 text-xs leading-snug text-[var(--text-secondary)]">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            Prefer hiding over deleting. Hidden adoptables keep everything and can be restored from
            this same panel at any time.
          </span>
        </p>
      </section>

      <ConfirmDialog
        open={confirmingDelete}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={runDelete}
        title={`Delete “${displayName}”?`}
        description="This is permanent. It cannot be undone."
        confirmLabel="Delete permanently"
        variant="danger"
        busy={deleting}
        requireTypedText={name}
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Everything attached to this adoptable is destroyed, including its main image, every
          gallery image, all before/after comparisons, the description, the pricing tiers and the
          character details.
        </p>
        <p className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-xs text-[var(--text-secondary)]">
          <strong className="text-white">Prefer not to?</strong> Use{" "}
          <strong className="text-white">Hide from public site</strong> instead. The adoptable keeps
          all of its media and can be brought back at any time.
        </p>
      </ConfirmDialog>
    </div>
  );
}