"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Image as ImageIcon, Loader2, Save, Trash2, Upload } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { deleteFromSupabaseStorage } from "@/lib/supabase/storage";
import { useToast } from "../Toast";
import { Card, CardHeader } from "../Card";
import { Button } from "../Button";
import { Field, Select } from "../Field";
import { uploadMedia } from "@/lib/upload/client";
import { UploadError } from "@/lib/upload/errors";
import {
  NO_AI_ENABLED_KEY,
  NO_AI_IMAGE_KEY,
  NO_AI_HEADING,
  NO_AI_PLACEMENT_KEY,
  NO_AI_PLACEMENTS,
  NO_AI_TAGLINE,
  isNoAiEnabled,
  noAiPlacement,
} from "@/lib/no-ai";

interface NoAiBadgeSectionProps {
  site: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

/**
 * Admin control for the public NO AI badge.
 *
 * The badge image is a fully independent asset: it is
 * uploaded through the normal media pipeline into its own
 * storage path and its own `site_images` row (key
 * "no_ai_badge"). It never touches any other icon or
 * image on the site, so replacing it cannot affect
 * branding anywhere else.
 *
 * The on/off state and placement are stored in
 * `site_config` (no_ai_enabled / no_ai_placement) and
 * persist through the normal save flow.
 */
export function NoAiBadgeSection({ site, onChange }: NoAiBadgeSectionProps) {
  const [image, setImage] = useState<{ url: string; path?: string } | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(() => isNoAiEnabled(site));
  const [placement, setPlacement] = useState(() => noAiPlacement(site));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setImagesLoaded(true);
        return;
      }
      try {
        const res = await fetch("/api/site-images");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Record<string, { url: string; path?: string }>;
        if (cancelled) return;
        setImage(data[NO_AI_IMAGE_KEY] || null);
      } catch {
        toast.error("Failed to load the NO AI badge image");
      } finally {
        if (!cancelled) setImagesLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const result = await uploadMedia(file, "site", { key: NO_AI_IMAGE_KEY });
      setImage({ url: result.url, path: result.path });
      toast.success("NO AI badge image updated");
    } catch (err) {
      const message =
        err instanceof UploadError ? err.message : err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  function triggerUpload() {
    fileInputRef.current?.click();
  }

  async function handleRemove() {
    if (!image) return;
    setRemoving(true);
    try {
      if (image.path) {
        await deleteFromSupabaseStorage("portfolio-images", image.path);
      }
      const res = await fetch("/api/site-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: NO_AI_IMAGE_KEY, path: image.path }),
      });
      if (!res.ok) throw new Error("Failed to remove image");
      setImage(null);
      toast.success("NO AI badge image removed");
    } catch {
      toast.error("Failed to remove the badge image");
    } finally {
      setRemoving(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const nextSite: Record<string, string> = {
        ...site,
        [NO_AI_ENABLED_KEY]: enabled ? "true" : "false",
        [NO_AI_PLACEMENT_KEY]: placement,
      };

      // Keep the page-level state in sync so the global
      // Save button also carries the badge settings.
      onChange(nextSite);

      // Persist directly: only the site_config keys are
      // sent, so no other content table is touched.
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site: nextSite }),
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        throw new Error(r.error || "Failed to save");
      }
      toast.success("NO AI badge settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <Card className="p-8">
        <CardHeader title="NO AI Badge" />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Supabase is not configured. Add credentials to manage the NO AI badge.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-[var(--accent)]/5 blur-[120px] orb-slow" />
      <CardHeader
        title="NO AI Badge"
        description="Manage the NO AI status shown on the public website. The badge image is an independent asset and does not affect any other icon."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Image management */}
        <div className="ad-section-card p-5">
          <h3 className="text-sm font-semibold text-white">Badge image</h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">
            Upload your own NO AI badge image. Recommended: a wide badge, up to 600×200px, PNG or WebP.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) handleUpload(file);
            }}
          />

          {!imagesLoaded ? (
            <div className="mt-4 grid h-40 place-items-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--text-dim)]" />
            </div>
          ) : (
            <div className="relative mt-4 aspect-[3/1] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt="Current NO AI badge"
                    className="h-full w-full object-contain p-4"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity duration-300 hover:opacity-100">
                    <Button size="sm" variant="secondary" onClick={triggerUpload} disabled={uploading}>
                      {uploading ? "Uploading…" : "Replace"}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={handleRemove}
                      disabled={uploading || removing}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Remove
                    </Button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={triggerUpload}
                  className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]"
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                  ) : (
                    <ImageIcon className="h-8 w-8 opacity-40" />
                  )}
                  <span className="text-xs">{uploading ? "Uploading…" : "Upload NO AI badge image"}</span>
                </button>
              )}
            </div>
          )}

          {!image && !uploading && (
            <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={triggerUpload} leftIcon={<Upload className="h-4 w-4" />}>
              Upload Image
            </Button>
          )}
        </div>

        {/* Preview + settings */}
        <div className="space-y-6">
          <div className="ad-section-card p-5">
            <h3 className="text-sm font-semibold text-white">Preview</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">
              How the badge currently appears on the public site.
            </p>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.url}
                    alt="NO AI badge preview"
                    className="max-h-16 w-auto max-w-[180px] object-contain"
                  />
                ) : null}
                <div>
                  <p className="text-sm font-bold tracking-[0.18em] text-white">{NO_AI_HEADING}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{NO_AI_TAGLINE}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="ad-section-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <BadgeCheck className="h-4 w-4 text-[var(--accent)]" />
              Display settings
            </h3>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">Show the NO AI badge</p>
                <p className="mt-0.5 text-xs text-[var(--text-dim)]">Turn the public status on or off.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label="Show the NO AI badge"
                onClick={() => setEnabled((v) => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  enabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    enabled ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <Field
              className="mt-4"
              label="Where the badge appears"
              hint="Footer shows on every page; Homepage shows below the hero."
              htmlFor="no-ai-placement"
            >
              <Select
                id="no-ai-placement"
                value={placement}
                onChange={(e) => setPlacement(e.target.value as (typeof NO_AI_PLACEMENTS)[number]["value"])}
              >
                {NO_AI_PLACEMENTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} — {option.desc}
                  </option>
                ))}
              </Select>
            </Field>

            <Button
              className="mt-5 w-full"
              size="md"
              onClick={handleSave}
              loading={saving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default NoAiBadgeSection;
