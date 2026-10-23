"use client";

import { useState, type ReactElement } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  EyeOff,
  ImagePlus,
  Images,
  Loader2,
  ScanEye,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import type { Adoptable } from "@/types/database";
import { describeMediaProblem } from "@/lib/adoptables/images";
import { Button } from "@/components/admin/Button";
import { UploadArea } from "@/components/admin/UploadArea";
import { Badge } from "@/components/admin/Badge";
import { Input } from "@/components/admin/Field";
import { AdoptableArtwork } from "@/components/adoptables/AdoptableArtwork";
import { ConfirmDialog } from "./ConfirmDialog";
import { Tooltip } from "./Tooltip";
import type { AdoptablesController, ComparisonDraft, GalleryDraft } from "./useAdoptables";

export interface MediaPanelProps {
  value: Adoptable;
  gallery: GalleryDraft[];
  comparisons: ComparisonDraft[];
  controller: AdoptablesController;
}

const IMAGE_FORMATS = ["PNG", "JPG", "WEBP", "GIF", "AVIF"];

function firstFile(files: FileList | null | undefined): File | null {
  if (!files) return null;
  for (const file of Array.from(files)) {
    if (file.type.startsWith("image/")) return file;
  }
  return files[0] ?? null;
}

function SideSlot({
  title,
  url,
  path,
  pending,
  onPick,
  disabled,
}: {
  title: string;
  url?: string | null;
  path?: string | null;
  pending?: boolean;
  onPick: (file: File) => void;
  disabled: boolean;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="ad-label">{title}</p>
      <div className="relative mt-1.5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
        <div className="aspect-[4/3] w-full">
          {url ? (
            <AdoptableArtwork
              url={url}
              path={path}
              alt={`${title} image`}
              wrapperClassName="h-full w-full"
              className="h-full w-full object-cover"
              fallbackLabel={`${title} image unavailable`}
              objectFit="contain"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-3 text-center">
              {pending ? (
                <Loader2 className="h-5 w-5 animate-spin text-[var(--text-dim)]" aria-hidden />
              ) : (
                <ImagePlus className="h-5 w-5 text-[var(--text-dim)]" aria-hidden />
              )}
              <p className="text-[11px] font-medium leading-snug text-[var(--text-dim)]">
                {pending ? "Uploading…" : "Not uploaded"}
              </p>
            </div>
          )}
        </div>
        {pending && url && (
          <span className="absolute inset-0 grid place-items-center bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden />
          </span>
        )}
      </div>
      <label className="mt-2 inline-flex">
        <span className="ad-btn ad-btn-secondary ad-btn-sm cursor-pointer">
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {url ? "Replace" : "Upload"}
        </span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={disabled || pending}
          aria-label={`Upload the ${title.toLowerCase()} image`}
          onChange={(event) => {
            const file = firstFile(event.target.files);
            event.target.value = "";
            if (file) onPick(file);
          }}
        />
      </label>
    </div>
  );
}

/**
 * Media management for one adoptable.
 *
 * Every action here writes through the controller immediately, so media state
 * is never part of the draft that the footer saves: a half-typed description
 * can no longer roll back an upload that already succeeded, and an upload can
 * never be silently discarded by a cancelled edit.
 */
export function MediaPanel({ value, gallery, comparisons, controller }: MediaPanelProps): ReactElement {
  const id = value.id;
  const busy = controller.busyIds.has(id);
  const name = value.title?.trim() || "Untitled adoptable";
  const [liveMessage, setLiveMessage] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<GalleryDraft | null>(null);
  const [removing, setRemoving] = useState(false);

  const mainProblem = describeMediaProblem(value.main_image, value.main_image_path);
  const hasMainImage = Boolean(value.main_image || value.main_image_path);

  const announce = (message: string) => {
    setLiveMessage("");
    window.setTimeout(() => setLiveMessage(message), 60);
  };

  const confirmRemoval = async () => {
    const target = pendingRemoval;
    setPendingRemoval(null);
    if (!target?.id) return;
    setRemoving(true);
    const ok = await controller.removeGalleryImage(id, target.id);
    setRemoving(false);
    announce(ok ? "Gallery image deleted" : "Could not delete the gallery image");
  };

  return (
    <div className="space-y-6">
      <p className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </p>

      {/* ---------------------------------- Main image */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">Main image</h3>
          <span className="text-xs text-[var(--text-dim)]">Recommended 1200×1200 px or larger</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <div className="aspect-square w-full">
              <AdoptableArtwork
                url={value.main_image}
                path={value.main_image_path}
                alt={`${name} main image`}
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover"
                fallbackLabel={mainProblem ?? "No main image"}
              />
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            {hasMainImage && mainProblem && (
              <p className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-2.5 py-2 text-[11px] leading-snug text-amber-200">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{mainProblem}</span>
              </p>
            )}

            <label className="block">
              <span className="ad-btn ad-btn-primary ad-btn-sm inline-flex cursor-pointer">
                <ImagePlus className="h-3.5 w-3.5" aria-hidden />
                {busy ? "Uploading…" : hasMainImage ? "Replace image" : "Upload image"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={busy}
                aria-label={`Upload the main image for ${name}`}
                onChange={async (event) => {
                  const file = firstFile(event.target.files);
                  event.target.value = "";
                  if (!file) return;
                  const ok = await controller.uploadMainImage(id, file);
                  announce(
                    ok
                      ? `Main image uploaded for ${name}`
                      : `Main image upload failed for ${name}`,
                  );
                }}
              />
            </label>

            {hasMainImage && (
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={async () => {
                  const ok = await controller.removeMainImage(id);
                  announce(ok ? `Main image removed from ${name}` : `Could not remove the main image`);
                }}
              >
                Remove main image
              </Button>
            )}

            <p className="text-xs leading-snug text-[var(--text-dim)]">
              The main image is the card artwork on the public site. If it cannot be resolved the
              page falls back to the first SFW gallery image.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------- Gallery */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Images className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            Gallery
          </h3>
          <Badge tone={gallery.length > 0 ? "accent" : "default"}>
            {gallery.length} image{gallery.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <UploadArea
          inputId={`adoptable-gallery-${id}`}
          title="Add gallery images"
          formats={IMAGE_FORMATS}
          uploading={busy}
          onFiles={async (files) => {
            if (!files || files.length === 0) return;
            const ok = await controller.uploadGallery(id, files);
            announce(
              ok
                ? `${files.length} gallery image${files.length === 1 ? "" : "s"} added to ${name}`
                : "Some gallery images could not be uploaded",
            );
          }}
        />

        {gallery.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg)] p-4 text-center text-xs leading-relaxed text-[var(--text-dim)]">
            No gallery images yet. Add detail shots, clothing toggles or extra angles here — they
            appear in the public gallery in this order, and the first SFW image is used as the card
            artwork when there is no main image.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((image, index) => (
              <li
                key={image.id ?? `pending-${index}`}
                className="ad-editor-media-tile relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]"
              >
                <div className="relative aspect-square w-full">
                  {image.url ? (
                    <AdoptableArtwork
                      url={image.url}
                      path={image.path}
                      alt={`${name} gallery image ${index + 1}`}
                      wrapperClassName="h-full w-full"
                      className="h-full w-full object-cover"
                      fallbackLabel="Image unavailable"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      {image.error ? (
                        <CircleAlert className="h-5 w-5 text-[var(--danger)]" aria-hidden />
                      ) : (
                        <Loader2 className="h-5 w-5 animate-spin text-[var(--text-dim)]" aria-hidden />
                      )}
                    </div>
                  )}

                  {image.is_nsfw && (
                    <span className="absolute left-1.5 top-1.5">
                      <Badge tone="danger">NSFW</Badge>
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/85 to-transparent p-1.5">
                    <div className="flex items-center gap-1">
                      <Tooltip label="Move earlier">
                        <button
                          type="button"
                          aria-label={`Move gallery image ${index + 1} earlier`}
                          disabled={index === 0 || busy}
                          onClick={() => void controller.moveGalleryImage(id, index, index - 1)}
                          className="grid h-7 w-7 place-items-center rounded-lg bg-black/55 text-white transition-colors hover:bg-black/75 disabled:opacity-30"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </Tooltip>
                      <Tooltip label="Move later">
                        <button
                          type="button"
                          aria-label={`Move gallery image ${index + 1} later`}
                          disabled={index === gallery.length - 1 || busy}
                          onClick={() => void controller.moveGalleryImage(id, index, index + 1)}
                          className="grid h-7 w-7 place-items-center rounded-lg bg-black/55 text-white transition-colors hover:bg-black/75 disabled:opacity-30"
                        >
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </Tooltip>
                    </div>

                    <div className="flex items-center gap-1">
                      <Tooltip label={image.is_nsfw ? "Mark as SFW" : "Mark as NSFW"}>
                        <button
                          type="button"
                          aria-pressed={Boolean(image.is_nsfw)}
                          aria-label={
                            image.is_nsfw
                              ? `Mark gallery image ${index + 1} as SFW`
                              : `Mark gallery image ${index + 1} as NSFW`
                          }
                          disabled={!image.id || busy}
                          onClick={() => {
                            if (!image.id) return;
                            void controller.setGalleryNsfw(id, image.id, !image.is_nsfw);
                          }}
                          className={`grid h-7 w-7 place-items-center rounded-lg transition-colors disabled:opacity-30 ${
                            image.is_nsfw
                              ? "bg-[var(--danger)] text-white"
                              : "bg-black/55 text-white hover:bg-black/75"
                          }`}
                        >
                          <EyeOff className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </Tooltip>
                      <Tooltip label="Delete image">
                        <button
                          type="button"
                          aria-label={`Delete gallery image ${index + 1}`}
                          disabled={!image.id || busy}
                          onClick={() => {
                            if (!image.id) return;
                            setPendingRemoval(image);
                          }}
                          className="grid h-7 w-7 place-items-center rounded-lg bg-black/55 text-white transition-colors hover:bg-[var(--danger)] disabled:opacity-30"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {image.error && (
                  <div className="border-t border-[var(--danger-border)] bg-[var(--danger-soft)] px-2 py-1.5">
                    <p className="text-[11px] leading-snug text-[var(--danger)]">{image.error}</p>
                    {!image.id && (
                      <button
                        type="button"
                        onClick={() => controller.dismissGalleryDraft(id, image)}
                        className="mt-1 text-[11px] font-semibold text-white underline underline-offset-2"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs leading-snug text-[var(--text-dim)]">
          Images marked NSFW are blurred behind the age gate on the public site. Order is saved as
          you change it.
        </p>
      </section>

      {/* ---------------------------------- Before / After */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <ScanEye className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            Before &amp; after
          </h3>
          <Badge tone={comparisons.length > 0 ? "accent" : "default"}>
            {comparisons.length} pair{comparisons.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <p className="text-xs leading-snug text-[var(--text-dim)]">
          Comparison pairs let visitors swipe between the base and finished versions. Either side
          can be left empty — upload one image to create a pair, then add its counterpart below.
        </p>

        {comparisons.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg)] p-4 text-center text-xs text-[var(--text-dim)]">
            No comparisons yet. Upload a “before” image to start a pair.
          </p>
        ) : (
          <ul className="space-y-4">
            {comparisons.map((pair, index) => (
              <li
                key={pair.id ?? `pair-${index}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4"
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <label className="min-w-0 flex-1">
                    <span className="ad-label">Label</span>
                    <Input
                      value={pair.label ?? ""}
                      disabled={!pair.id}
                      placeholder="e.g. Base → fully dressed"
                      maxLength={120}
                      onChange={(event) => {
                        if (!pair.id) return;
                        void controller.setComparisonLabel(id, pair.id, event.target.value);
                      }}
                    />
                  </label>
                  <Tooltip label="Delete this comparison">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!pair.id || busy}
                      leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => {
                        if (!pair.id) return;
                        void controller.removeComparison(id, pair.id);
                      }}
                    >
                      Delete
                    </Button>
                  </Tooltip>
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                  <SideSlot
                    title="Before"
                    url={pair.before_url}
                    path={pair.before_path}
                    pending={pair.pending && !pair.after_url}
                    disabled={busy}
                    onPick={(file) => {
                      void controller.uploadComparisonSide(id, "before", file).then((ok) =>
                        announce(
                          ok
                            ? `Before image uploaded for pair ${index + 1}`
                            : `Before image upload failed for pair ${index + 1}`,
                        ),
                      );
                    }}
                  />
                  <SideSlot
                    title="After"
                    url={pair.after_url}
                    path={pair.after_path}
                    pending={pair.pending && !pair.before_url}
                    disabled={busy}
                    onPick={(file) => {
                      void controller.uploadComparisonSide(id, "after", file).then((ok) =>
                        announce(
                          ok
                            ? `After image uploaded for pair ${index + 1}`
                            : `After image upload failed for pair ${index + 1}`,
                        ),
                      );
                    }}
                  />
                </div>

                {pair.error && (
                  <p className="mt-3 flex items-start gap-2 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-2.5 py-2 text-[11px] leading-snug text-[var(--danger)]">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{pair.error}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={pendingRemoval !== null}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={confirmRemoval}
        title="Delete this gallery image?"
        description="The file is removed from storage as well as the gallery."
        confirmLabel="Delete image"
        busy={removing}
      >
        <p className="text-sm text-[var(--text-secondary)]">
          This permanently deletes the image from <span className="text-white">{name}</span> and
          from storage. It cannot be undone, and the order of the remaining images will be
          renumbered.
        </p>
      </ConfirmDialog>
    </div>
  );
}