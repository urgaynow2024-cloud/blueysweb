"use client";

import { useState, useRef } from "react";
import { CheckCircle2, Trash2, Edit2, X, ImageIcon, Loader2 } from "lucide-react";
import StarRating from "@/components/StarRating";
import { uploadImage } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Card, CardHeader } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";

interface Props {
  value: any[];
  onChange: (next: any[]) => void;
}

function ReviewCard({ review, index, reviews, setReviews }: { review: any; index: number; reviews: any[]; setReviews: (n: any[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: review.display_name,
    review_text: review.review_text,
    rating: review.rating,
    image_url: review.image_url || null,
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "reviews");
      if (url) setEditData((d) => ({ ...d, image_url: url }));
    } catch {
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${review.status === "approved" ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>
          {review.status === "approved" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-2 w-2 animate-pulse rounded-full bg-current" />}
          {review.status === "approved" ? "Approved" : "Pending"}
        </span>
        <div className="flex gap-2">
          {review.status !== "approved" && (
            <Button size="sm" variant="ghost" onClick={() => setReviews(reviews.map((r) => (r.id === review.id ? { ...r, status: "approved" } : r)))} className="!text-emerald-400 hover:!bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4" /> Approve
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setEditing((v) => !v)} className={editing ? "!text-white" : "!text-[var(--accent)]"}>
            <Edit2 className="h-4 w-4" /> {editing ? "Cancel" : "Edit"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setReviews(reviews.filter((r) => r.id !== review.id))} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 space-y-4">
          <Field label="Name">
            <Input value={editData.display_name} onChange={(e) => setEditData({ ...editData, display_name: e.target.value })} />
          </Field>
          <Field label="Rating">
            <StarRating value={editData.rating || 5} onChange={(val) => setEditData({ ...editData, rating: val })} />
          </Field>
          <Field label="Review">
            <Textarea rows={3} value={editData.review_text} onChange={(e) => setEditData({ ...editData, review_text: e.target.value })} />
          </Field>
          <Field label="Review image (optional)">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {editData.image_url ? (
              <div className="group relative w-fit">
                <img src={editData.image_url} alt="Review preview" className="h-40 rounded-xl border border-[var(--border)] object-cover" />
                <button
                  type="button"
                  onClick={() => setEditData((d) => ({ ...d, image_url: null }))}
                  aria-label="Remove image"
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-[var(--danger)] text-white transition-colors hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !isSupabaseConfigured}
                className="ad-upload !flex-row !gap-3 !p-4"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" /> : <ImageIcon className="h-5 w-5" />}
                <span className="text-sm">{uploading ? "Uploading…" : "Click to add an image"}</span>
              </button>
            )}
          </Field>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={() => { setReviews(reviews.map((r) => (r.id === review.id ? { ...r, ...editData } : r))); setEditing(false); }}>
              Save
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 text-lg font-bold text-white">
              {review.display_name?.[0]?.toUpperCase() || "★"}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{review.display_name}</p>
              <div className="mt-0.5 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`text-[var(--text-dim)] ${i <= (review.rating || 5) ? "text-[var(--accent)]" : ""}`}>★</span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">"{review.review_text}"</p>
          {review.image_url && <img src={review.image_url} alt="Review" className="mt-3 h-40 rounded-xl border border-[var(--border)] object-cover" />}
        </div>
      )}
    </Card>
  );
}

export function ReviewsSection({ value, onChange }: Props) {
  const pending = value.filter((r) => r.status === "pending");
  const approved = value.filter((r) => r.status === "approved");

  return (
    <div className="space-y-6">
      <CardHeader title="Client Reviews" description="Approve, edit, or remove client reviews." />

      <div>
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Pending ({pending.length})</p>
        <div className="space-y-4">
          {pending.length > 0 ? (
            pending.map((review, idx) => <ReviewCard key={review.id || idx} review={review} index={idx} reviews={value} setReviews={onChange} />)
          ) : (
            <div className="ad-empty rounded-[var(--r-md)] border border-dashed border-[var(--border)]">
              <p className="text-sm text-[var(--text-secondary)]">No pending reviews</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Approved ({approved.length})</p>
        <div className="space-y-4">
          {approved.length > 0 ? (
            approved.map((review, idx) => <ReviewCard key={review.id || idx} review={review} index={idx} reviews={value} setReviews={onChange} />)
          ) : (
            <div className="ad-empty rounded-[var(--r-md)] border border-dashed border-[var(--border)]">
              <p className="text-sm text-[var(--text-secondary)]">No approved reviews yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
