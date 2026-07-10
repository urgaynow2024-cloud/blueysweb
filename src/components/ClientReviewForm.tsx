"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, CheckCircle2, X, Loader2 } from "lucide-react";
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

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

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
      <div className="glass rounded-2xl p-8 text-center border border-[var(--border)]">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 grid place-items-center text-xl text-[var(--accent)]">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Review submitted</h3>
        <p className="text-sm text-[var(--text-secondary)]">Thanks for your feedback! It will be reviewed and published shortly.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-7 md:p-8 border border-[var(--border)]">
      <h2 className="text-lg font-bold text-white mb-1">Leave a Review</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Had a commission with me? Share your experience.</p>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {errorMessage || "Please fill in all required fields correctly."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Your name <span className="text-[#ff6b6b]">*</span>
          </label>
          <input
            name="display_name"
            required
            placeholder="e.g. VRC Fan"
            className="field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Rating <span className="text-[#ff6b6b]">*</span>
          </label>
          <StarRating value={starRating} onChange={setStarRating} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Your review <span className="text-[#ff6b6b]">*</span>
          </label>
          <textarea
            name="review_text"
            required
            rows={4}
            placeholder="What was your experience like?"
            className="field resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Commission image (optional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative group">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-[var(--border)]" />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-5 py-6 rounded-2xl bg-[var(--bg)] border border-dashed border-[var(--border)] text-center cursor-pointer hover:border-[var(--accent)] hover:text-[var(--text-secondary)] transition-all disabled:opacity-50"
              disabled={!isSupabaseConfigured || uploadingImage}
            >
              {uploadingImage ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                  <p className="text-sm text-[var(--text-secondary)]">Uploading...</p>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 mx-auto mb-1.5 text-[var(--text-dim)]" />
                  <p className="text-sm text-[var(--text-dim)]">Click to upload an image</p>
                </>
              )}
            </button>
          )}
          {!isSupabaseConfigured && (
            <p className="text-xs text-[var(--text-dim)] mt-1.5">Image upload requires Supabase configuration</p>
          )}
        </div>

        <button type="submit" disabled={submitting} className="w-full btn-primary justify-center !py-3.5 disabled:opacity-50">
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
