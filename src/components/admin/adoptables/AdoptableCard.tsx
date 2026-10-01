"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImageIcon,
  MoreHorizontal,
  Pencil,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
} from "lucide-react";
import type { Adoptable } from "@/types/database";
import { normalizeStatus } from "@/lib/adoptables/status";
import { categoryLabel, adoptablePriceSummary, priceSortValue } from "@/lib/adoptables/catalog";
import { pickAdoptableArtwork, describeMediaProblem } from "@/lib/adoptables/images";
import { AdoptableArtwork } from "@/components/adoptables/AdoptableArtwork";
import { StatusControl } from "./StatusControl";
import { Tooltip } from "./Tooltip";
import type { GalleryDraft, ComparisonDraft } from "./useAdoptables";
import type { AdoptableStatus } from "@/lib/adoptables/status";

interface AdoptableCardProps {
  adoptable: Adoptable;
  gallery: GalleryDraft[];
  comparisons: ComparisonDraft[];
  busy: boolean;
  dirty: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (adoptable: Adoptable) => void;
  onStatusChange: (id: string, status: AdoptableStatus) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onToggleVisibility: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDelete: (adoptable: Adoptable) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function relativeTime(value?: string | null): string {
  if (!value) return "Never updated";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "Recently";
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return "Updated just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `Updated ${days}d ago`;
  return `Updated ${new Date(then).toLocaleDateString()}`;
}

export function AdoptableCard({
  adoptable,
  gallery,
  comparisons,
  busy,
  dirty,
  selected,
  onToggleSelect,
  onEdit,
  onStatusChange,
  onToggleFeatured,
  onToggleVisibility,
  onMove,
  onDelete,
  canMoveUp,
  canMoveDown,
}: AdoptableCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const status = normalizeStatus(adoptable.availability);
  const artwork = pickAdoptableArtwork(adoptable, gallery as any);
  const mediaProblem = artwork ? null : describeMediaProblem(adoptable.main_image, adoptable.main_image_path);
  const priceSummary = adoptablePriceSummary(adoptable, true);
  const hasPricedTier =
    Boolean(adoptable.sfw_price && adoptable.sfw_available) ||
    Boolean(adoptable.nsfw_price && adoptable.nsfw_available) ||
    Boolean(adoptable.bundle_price && adoptable.bundle_available);
  const isListed = status !== "hidden";

  return (
    <article
      className={`ad-opt-card group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
        selected
          ? "border-[var(--accent)]/60 bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]"
      }`}
    >
      {/* Artwork */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--bg)]">
        <AdoptableArtwork
          url={adoptable.main_image}
          path={adoptable.main_image_path}
          alt={adoptable.title || "Untitled adoptable"}
          wrapperClassName="h-full w-full"
          className="h-full w-full object-cover"
          fallbackLabel={mediaProblem ?? "No artwork uploaded"}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Top-left: select + featured + order */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <label
            className="pointer-events-auto flex cursor-pointer items-center"
            title="Select for bulk actions"
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(adoptable.id)}
              className="peer sr-only"
              aria-label={`Select ${adoptable.title || "untitled adoptable"}`}
            />
            <span className="grid h-6 w-6 place-items-center rounded-md border border-white/25 bg-black/50 text-white backdrop-blur transition-colors peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)]">
              {selected && <span className="text-[11px] font-black leading-none">✓</span>}
            </span>
          </label>

          {adoptable.featured && (
            <Tooltip label="Featured on the public site">
              <span className="pointer-events-auto grid h-6 w-6 place-items-center rounded-md border border-[var(--accent)]/50 bg-[var(--accent-soft)] text-[var(--accent)] backdrop-blur">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
              </span>
            </Tooltip>
          )}

          {dirty && (
            <Tooltip label="Unsaved changes in the editor">
              <span className="pointer-events-auto grid h-6 w-6 place-items-center rounded-md border border-amber-500/50 bg-amber-500/15 text-amber-300 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
              </span>
            </Tooltip>
          )}
        </div>

        {/* Top-right: order controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
          <Tooltip label="Move earlier" side="left">
            <button
              type="button"
              onClick={() => onMove(adoptable.id, -1)}
              disabled={!canMoveUp || busy}
              aria-label="Move adoptable earlier"
              className="grid h-7 w-7 place-items-center rounded-lg border border-white/15 bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75 disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" aria-hidden />
            </button>
          </Tooltip>
          <Tooltip label="Move later" side="left">
            <button
              type="button"
              onClick={() => onMove(adoptable.id, 1)}
              disabled={!canMoveDown || busy}
              aria-label="Move adoptable later"
              className="grid h-7 w-7 place-items-center rounded-lg border border-white/15 bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75 disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
          </Tooltip>
        </div>

        {/* Bottom: status + name */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold leading-tight text-white drop-shadow">
              {adoptable.title || "Untitled adoptable"}
            </h3>
            <p className="mt-0.5 truncate text-[11px] uppercase tracking-wider text-white/65">
              {adoptable.species ? `${adoptable.species} · ` : ""}
              {categoryLabel(adoptable.category)}
            </p>
          </div>
          <StatusControl
            value={status}
            onChange={(next) => onStatusChange(adoptable.id, next)}
            name={adoptable.title || "this adoptable"}
            busy={busy}
            align="right"
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-white">{priceSummary}</span>
          {priceSortValue(adoptable) !== Number.POSITIVE_INFINITY && (
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              {hasPricedTier ? "Tiered" : "Legacy"}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`ad-badge ${
              adoptable.sfw_available ? "border-emerald-500/30 text-emerald-300" : "border-[var(--border-strong)] text-[var(--text-dim)]"
            }`}
          >
            SFW {adoptable.sfw_available ? "✓" : "—"}
          </span>
          <span
            className={`ad-badge ${
              adoptable.nsfw_available ? "border-rose-500/30 text-rose-300" : "border-[var(--border-strong)] text-[var(--text-dim)]"
            }`}
          >
            NSFW {adoptable.nsfw_available ? "✓" : "—"}
          </span>
          {gallery.length > 0 && (
            <span className="ad-badge border-[var(--border-strong)] text-[var(--text-secondary)]">
              <ImageIcon className="mr-1 inline h-3 w-3" aria-hidden />
              {gallery.length}
            </span>
          )}
          {comparisons.length > 0 && (
            <span className="ad-badge border-[var(--border-strong)] text-[var(--text-secondary)]">
              B/A {comparisons.length}
            </span>
          )}
          {!isListed && (
            <span className="ad-badge border-slate-500/30 text-slate-300">Not listed</span>
          )}
        </div>

        {mediaProblem && (
          <p className="rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-2.5 py-1.5 text-[11px] leading-snug text-amber-200">
            {mediaProblem}
          </p>
        )}

        <p className="text-[11px] text-[var(--text-dim)]">{relativeTime(adoptable.updated_at)}</p>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 border-t border-[var(--border)] pt-3">
          <button
            type="button"
            onClick={() => onEdit(adoptable)}
            className="ad-btn ad-btn-secondary ad-btn-sm inline-flex items-center gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit
          </button>

          {isListed ? (
            <Link
              href={`/adoptables/${adoptable.id}`}
              target="_blank"
              rel="noreferrer"
              className="ad-btn ad-btn-ghost ad-btn-sm inline-flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Preview
            </Link>
          ) : (
            <Tooltip label="Hidden adoptables have no public page">
              <span className="ad-btn ad-btn-ghost ad-btn-sm cursor-not-allowed opacity-40">
                <Eye className="h-3.5 w-3.5" aria-hidden />
                Preview
              </span>
            </Tooltip>
          )}

          <div ref={menuRef} className="relative ml-auto">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`More actions for ${adoptable.title || "untitled adoptable"}`}
              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              )}
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="ad-status-menu absolute right-0 z-40 mt-1.5 w-52 overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/60"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleFeatured(adoptable.id, !adoptable.featured);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs text-[var(--text-secondary)] transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <Star className="h-3.5 w-3.5" aria-hidden />
                  {adoptable.featured ? "Remove from featured" : "Mark as featured"}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleVisibility(adoptable.id);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs text-[var(--text-secondary)] transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  {isListed ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
                  {isListed ? "Hide from public site" : "Return to public site"}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(adoptable);
                  }}
                  className="flex w-full items-center gap-2.5 border-t border-[var(--border)] px-3.5 py-2.5 text-left text-xs text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Delete permanently…
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
