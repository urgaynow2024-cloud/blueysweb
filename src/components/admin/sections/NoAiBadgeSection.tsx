"use client";

import { useState } from "react";
import { Image as ImageIcon, Upload, Eye, EyeOff, Move, LayoutGrid } from "lucide-react";
import { Card, CardHeader } from "@/components/admin/Card";
import { Field, Select } from "@/components/admin/Field";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Field";
import { useToast } from "@/components/admin/Toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { uploadMedia } from "@/lib/upload/client";
import { UploadError } from "@/lib/upload/errors";

interface Props {
  site: any;
  onChange: (next: any) => void;
}

const PLACEMENTS = [
  { value: "hero", label: "Hero banner" },
  { value: "footer", label: "Footer strip" },
  { value: "sticky", label: "Sticky top bar" },
];

export function NoAiBadgeSection({ site, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(site?.no_ai_badge_url || null);
  const toast = useToast();

  async function handleUpload(file: File) {
    if (!isSupabaseConfigured || !supabase) {
      toast.error("Supabase is not configured");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadMedia(file, "site");
      if (result?.url) {
        setPreview(result.url);
        onChange({ ...site, no_ai_badge_url: result.url, no_ai_badge_enabled: true });
        toast.success("Badge uploaded");
      }
    } catch (e) {
      const msg = e instanceof UploadError ? e.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  function handleToggle(enabled: boolean) {
    onChange({ ...site, no_ai_badge_enabled: enabled });
  }

  function handlePlacement(placement: string) {
    onChange({ ...site, no_ai_badge_placement: placement });
  }

  function handleRemove() {
    setPreview(null);
    onChange({ ...site, no_ai_badge_url: null, no_ai_badge_enabled: false });
    toast.success("Badge removed");
  }

  return (
    <div className="space-y-6 relative">
      <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-[var(--accent)]/5 blur-[120px] orb-slow" />
      <div className="relative z-10">
        <CardHeader title="NO AI Badge" description="Manage the badge shown on the site to indicate no AI was used in the work." />

        <Card className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Field label="Badge image">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="ad-upload !flex-row !gap-3 !p-4 cursor-pointer">
                    <Upload className="h-5 w-5" />
                    <span className="text-sm">{uploading ? "Uploading…" : "Upload badge"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {preview && (
                    <button type="button" onClick={handleRemove} className="text-xs text-[var(--danger)] hover:underline">
                      Remove
                    </button>
                  )}
                </div>
                {preview && (
                  <div className="relative inline-block">
                    <img src={preview} alt="Badge preview" className="h-24 w-auto max-w-[240px] rounded-xl border border-[var(--border)] object-contain bg-[var(--bg-soft)]" />
                    <span className="mt-2 block text-xs text-[var(--text-secondary)]">
                      Badge is shown at its natural aspect ratio. It scales responsively within its banner.
                    </span>
                  </div>
                )}
                {!preview && (
                  <p className="text-xs text-[var(--text-secondary)]">No badge uploaded yet. Upload an image to enable the badge.</p>
                )}
              </Field>
            </div>

            <div className="space-y-4">
              <Field label="Visibility">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(true)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${site?.no_ai_badge_enabled ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-[var(--border)] text-[var(--text-secondary)]"}`}
                  >
                    <Eye className="h-4 w-4" /> Visible
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(false)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${!site?.no_ai_badge_enabled ? "border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text-secondary)]" : "border-[var(--border)] text-[var(--text-secondary)]"}`}
                  >
                    <EyeOff className="h-4 w-4" /> Hidden
                  </button>
                </div>
              </Field>

              <Field label="Placement">
                <Select value={site?.no_ai_badge_placement || "hero"} onChange={(e) => handlePlacement(e.target.value)}>
                  {PLACEMENTS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default NoAiBadgeSection;