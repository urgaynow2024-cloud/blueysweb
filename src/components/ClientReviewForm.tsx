"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, CheckCircle2, X, Loader2, AlertCircle } from "lucide-react";
import StarRating from "./StarRating";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function ClientReviewForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [starRating, setStarRating] = useState(5);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const display_name = (formData.get("display_name") as string).trim();
    const review_text = (formData.get("review_text") as string).trim();

    if (!display_name || !review_text) {
      setError(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name,
          review_text,
          rating: starRating,
          image_url: imagePreview,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(true);
        setErrorMessage(result.error || "Failed to submit review");
      }
    } catch {
      setError(true);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "reviews");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (res.ok && result.url) {
        setImagePreview(result.url);
      } else {
        console.error("Upload failed:", result.error);
        alert("Image upload failed: " + (result.error || "Unknown error"));
      }
    } catch (e) {
      console.error("Image upload failed:", e);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  }

  if (submitted) {
    return (
      <div className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-[var(--accent-2)]/8" />
        <div className="relative">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Review submitted</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Thanks for your feedback! It will be reviewed and published shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7 md:p-8">
      <h2 className="text-lg font-bold text-white">Leave a Review</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Had a commission with me? Share your experience.</p>

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage || "Please fill in all required fields correctly."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
            Your name <span className="text-[var(--danger)]">*</span>
          </label>
          <input name="display_name" required placeholder="e.g. VRC Fan" className="field" />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
            Rating <span className="text-[var(--danger)]">*</span>
          </label>
          <StarRating value={starRating} onChange={setStarRating} />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
            Your review <span className="text-[var(--danger)]">*</span>
          </label>
          <textarea name="review_text" required rows={4} placeholder="What was your experience like?" className="field resize-y" />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">Commission image (optional)</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          {imagePreview ? (
            <div className="group relative">
              <img src={imagePreview} alt="Preview" className="h-48 w-full rounded-xl border border-[var(--border)] object-cover" />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isSupabaseConfigured || uploadingImage}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-5 py-6 text-center text-[var(--text-dim)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-secondary)] disabled:opacity-50"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm">Click to upload an image</span>
                </>
              )}
            </button>
          )}
          {!isSupabaseConfigured && <p className="mt-1.5 text-xs text-[var(--text-dim)]">Image upload requires Supabase configuration</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full !justify-center !py-3.5 disabled:opacity-50">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Submit Review
            </>
          )}
        </button>
      </form>
    </div>
  );
}
