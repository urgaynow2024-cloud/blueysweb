"use client";

import { useId, useState, useEffect, useRef } from "react";
import { CheckCircle2, Send, Paperclip, AlertCircle, Loader2 } from "lucide-react";
import { getCommissionFormFields } from "@/lib/db";

interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
  options: string[];
  max_size_mb: number;
}

export default function ContactCommissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const discordId = useId();
  const descId = useId();
  const budgetId = useId();
  const deadlineId = useId();
  const refsId = useId();
  const notesId = useId();

  useEffect(() => {
    async function load() {
      try {
        const data = await getCommissionFormFields();
        if (data && data.length > 0) {
          setFields(data);
        }
      } catch (e) {
        console.error("Failed to load form fields:", e);
      } finally {
        setLoadingFields(false);
      }
    }
    load();
  }, []);

  const activeFields = fields.length > 0 ? fields : [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);
    setErrorMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data: Record<string, any> = {};
    activeFields.forEach((f) => {
      data[f.name] = formData.get(f.name);
    });

    try {
      const res = await fetch("/api/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
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
      <div className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-10 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-[var(--accent-2)]/8" />
        <div className="relative">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Request received</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Thanks for your feedback! I&rsquo;ll review your request and get back to you on Discord or email within 24&ndash;48 hours.</p>
          <a href="/" className="btn-primary mt-8 inline-flex">Back to Home</a>
        </div>
      </div>
    );
  }

  if (loadingFields) {
    return (
      <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7 md:p-10">
        <div className="space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-24 rounded bg-[var(--bg)]" />
              <div className="mt-2 h-10 rounded bg-[var(--bg)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-7 md:p-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Send className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Commission Request</h2>
          <p className="text-sm text-[var(--text-secondary)]">Tell me about the avatar work you need</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage || "Please fill in all required fields correctly."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {activeFields.map((field) => {
          const id = field.name === "name" ? nameId : field.name === "discord" ? discordId : field.name === "description" ? descId : field.name === "budget" ? budgetId : field.name === "deadline" ? deadlineId : field.name === "references" ? refsId : notesId;
          if (field.type === "textarea") {
            return (
              <div key={field.name}>
                <label htmlFor={id} className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
                  {field.label} {field.required && <span className="text-[var(--danger)]">*</span>}
                </label>
                <textarea id={id} name={field.name} required={field.required} rows={4} placeholder={field.placeholder} className="field resize-y" />
              </div>
            );
          }
          if (field.type === "file") {
            return (
              <div key={field.name}>
                <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
                  {field.label} {field.required && <span className="text-[var(--danger)]">*</span>}
                </label>
                <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-5 py-7 text-center text-sm text-[var(--text-dim)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-secondary)]">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm">Drop files or paste links</span>
                </div>
                <textarea name={field.name} rows={3} placeholder={field.placeholder} className="field resize-y mt-3" />
              </div>
            );
          }
          if (field.type === "select") {
            return (
              <div key={field.name}>
                <label htmlFor={id} className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
                  {field.label} {field.required && <span className="text-[var(--danger)]">*</span>}
                </label>
                <select id={id} name={field.name} required={field.required} className="field">
                  <option value="">Select an option</option>
                  {(field.options || []).map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          }
          if (field.type === "checkbox") {
            return (
              <div key={field.name} className="flex items-start gap-3">
                <input id={id} type="checkbox" name={field.name} className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                <label htmlFor={id} className="text-sm text-[var(--text-secondary)]">{field.label}</label>
              </div>
            );
          }
          return (
            <div key={field.name}>
              <label htmlFor={id} className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
                {field.label} {field.required && <span className="text-[var(--danger)]">*</span>}
              </label>
              <input id={id} type={field.type} name={field.name} required={field.required} placeholder={field.placeholder} className="field" />
            </div>
          );
        })}

        <div>
          <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
            Commission image (optional)
          </label>
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
                <Paperclip className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-5 py-6 text-center text-sm text-[var(--text-dim)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-secondary)] disabled:opacity-50"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Paperclip className="h-5 w-5" />
                  <span className="text-sm">Click to upload an image</span>
                </>
              )}
            </button>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full !justify-center !py-3.5 disabled:opacity-50">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}