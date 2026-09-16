"use client";

import { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CloudUpload,
  FileImage,
  FileText,
  Image,
  Loader2,
  Pencil,
  Paperclip,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  Video,
  X,
} from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { uploadMedia } from "@/lib/upload/client";
import { getAcceptAttribute } from "@/lib/compression/client";
import { UploadError } from "@/lib/upload/errors";
import type { UploadResult } from "@/lib/upload/types";
import { siteConfig } from "@/config/site";

type CommissionType = "avatar" | "texture" | "editing" | "other";

type FormErrors = Partial<Record<
  "name" | "discord" | "email" | "commissionType" | "description" | "agreed" | "ownsAssets" | "adoptableProof" | "refundsUnderstood",
  string
>>;

type UploadItem = {
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  result?: UploadResult;
  error?: string;
};

const STEPS = [
  { id: 0, title: "About", icon: User },
  { id: 1, title: "Project", icon: Pencil },
  { id: 2, title: "Details", icon: FileText },
  { id: 3, title: "Review", icon: CheckCircle2 },
] as const;

const MAX_UPLOADS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function StepNav({ current, onStep }: { current: number; onStep: (step: number) => void }) {
  const pct = Math.round(((current + 1) / STEPS.length) * 100);

  return (
    <div className="mb-8" aria-label="Commission form progress">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
        <span className="flex items-center gap-2">
          <Circle className="h-3 w-3 text-[var(--accent)]" />
          Step {current + 1} of {STEPS.length}: {STEPS[current].title}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]" aria-hidden="true">
        <div className="progress-fill h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const done = s.id < current;
          const active = s.id === current;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onStep(s.id)}
              disabled={s.id > current}
              aria-current={active ? "step" : undefined}
              className={`flex flex-col items-center gap-1.5 text-center transition-opacity ${
                active ? "text-white" : done ? "text-[var(--accent)]" : "cursor-not-allowed text-[var(--text-dim)] opacity-50"
              }`}
            >
              <span className={`grid h-8 w-8 place-items-center rounded-lg border ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : done
                    ? "border-[var(--accent)]/40 bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)]"
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide">{s.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadPreview({ item, onRemove, disabled }: { item: UploadItem; onRemove: () => void; disabled: boolean }) {
  const Icon = item.file.type.startsWith("image/") ? FileImage : FileText;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 transition-all hover:border-[var(--accent)]/40">
      {item.file.type.startsWith("image/") && (
        <img src={item.previewUrl} alt="" className="mb-2 h-16 w-full rounded-lg object-cover" />
      )}
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-white">{item.file.name}</p>
          <p className="text-[10px] text-[var(--text-dim)]">{formatBytes(item.file.size)}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="grid h-6 w-6 place-items-center rounded-full bg-red-500/10 text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
          aria-label={`Remove ${item.file.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {item.status === "uploading" && (
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress}>
            <div className="progress-fill h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]" style={{ width: `${item.progress}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-[var(--text-dim)]">{item.progress}% uploading</p>
        </div>
      )}
      {item.status === "success" && (
        <p className="mt-2 flex items-center gap-1 text-[10px] text-[var(--success)]"><CheckCircle2 className="h-3 w-3" /> Ready</p>
      )}
      {item.status === "error" && (
        <p className="mt-2 flex items-center gap-1 text-[10px] text-[var(--danger)]"><AlertCircle className="h-3 w-3" /> {item.error || "Upload failed"}</p>
      )}
    </div>
  );
}

function UploadZone({ onAdd, disabled }: { onAdd: (files: File[]) => void; disabled: boolean }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const accept = getAcceptAttribute();
  const zoneId = useId();

  const handleFiles = (files: File[] | FileList) => {
    if (!disabled) onAdd(Array.from(files));
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-labelledby={zoneId}
      className={`relative rounded-2xl border-2 border-dashed p-7 text-center transition-all outline-none ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${dragOver ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]/50 focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30`}`}
      onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        if (event.dataTransfer.files) handleFiles(event.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !disabled) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          if (event.target.files) handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
        <CloudUpload className="h-6 w-6" />
      </div>
      <p id={zoneId} className="text-sm font-semibold text-white">Drop files here or browse files</p>
      <p className="mt-1 text-xs text-[var(--text-dim)]">PNG, JPG, WEBP, GIF, MP4 or WebM · up to 50MB each</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg)] px-2.5 py-1 text-[10px] text-[var(--text-dim)]">
          <Image className="h-3 w-3" /> Image
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg)] px-2.5 py-1 text-[10px] text-[var(--text-dim)]">
          <Video className="h-3 w-3" /> Video
        </span>
      </div>
    </div>
  );
}

function CheckboxField({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed transition-colors ${
        error ? "border-[var(--danger)] bg-[var(--danger)]/5" : "border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]"
      }`}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
        />
        <span className={error ? "text-[var(--danger)]" : "text-[var(--text-secondary)]"}>{children}</span>
      </label>
      {error && <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--danger)]"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>}
    </div>
  );
}

export default function ContactCommissionForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [name, setName] = useState("");
  const [discord, setDiscord] = useState("");
  const [email, setEmail] = useState("");
  const [commissionType, setCommissionType] = useState<CommissionType | "">("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [references, setReferences] = useState("");
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [ownsAssets, setOwnsAssets] = useState(false);
  const [adoptableProof, setAdoptableProof] = useState(false);
  const [refundsUnderstood, setRefundsUnderstood] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const nameId = useId();
  const discordId = useId();
  const emailId = useId();
  const typeId = useId();
  const descId = useId();
  const budgetId = useId();
  const deadlineId = useId();
  const refsId = useId();
  const notesId = useId();
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const validateStep = (targetStep = step) => {
    const nextErrors: FormErrors = {};

    if (targetStep === 0) {
      if (!name.trim()) nextErrors.name = "Please enter your name.";
      if (!discord.trim()) nextErrors.discord = "Please enter your Discord username.";
      if (email.trim() && !EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    }

    if (targetStep === 1) {
      if (!commissionType) nextErrors.commissionType = "Choose the type of work you need.";
      if (description.trim().length < 10) nextErrors.description = "Describe your project in at least 10 characters.";
    }

    if (targetStep === 3) {
      if (!agreed) nextErrors.agreed = "Please accept the Terms of Service.";
      if (!ownsAssets) nextErrors.ownsAssets = "Please confirm ownership or permission for supplied assets.";
      if (!adoptableProof) nextErrors.adoptableProof = "Please confirm you understand the proof requirement.";
      if (!refundsUnderstood) nextErrors.refundsUnderstood = "Please confirm you understand the refund policy.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const focusFirstError = (nextErrors: FormErrors) => {
    const firstKey = Object.keys(nextErrors)[0];
    if (!firstKey) return;
    window.setTimeout(() => fieldRefs.current[firstKey]?.focus(), 0);
  };

  const goToStep = (nextStep: number) => {
    const boundedStep = Math.max(0, Math.min(3, nextStep));
    setStep(boundedStep);
    window.setTimeout(() => stepHeadingRef.current?.focus(), 0);
  };

  const handleNext = () => {
    if (!validateStep()) {
      focusFirstError(errors);
      return;
    }
    goToStep(step + 1);
  };

  const handleBack = () => goToStep(step - 1);

  const addFiles = useCallback((files: File[]) => {
    setUploadError(null);
    const supported = files.filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
    const unsupported = files.filter((file) => !file.type.startsWith("image/") && !file.type.startsWith("video/"));
    const oversized = supported.filter((file) => file.size > 50 * 1024 * 1024);
    const candidates = supported.filter((file) => file.size <= 50 * 1024 * 1024);
    const duplicateKeys = new Set(uploads.map((item) => `${item.file.name}:${item.file.size}:${item.file.lastModified}`));
    const unique = candidates.filter((file) => {
      const key = `${file.name}:${file.size}:${file.lastModified}`;
      if (duplicateKeys.has(key)) return false;
      duplicateKeys.add(key);
      return true;
    });
    const remainingSlots = Math.max(0, MAX_UPLOADS - uploads.length);
    const accepted = unique.slice(0, remainingSlots);
    const messages = [
      unsupported.length ? `${unsupported.length} unsupported file${unsupported.length === 1 ? " was" : "s were"} skipped. Use images or videos.` : "",
      oversized.length ? `${oversized.length} file${oversized.length === 1 ? " exceeds" : "s exceed"} the 50MB limit.` : "",
      unique.length > remainingSlots ? `Only ${remainingSlots} more file${remainingSlots === 1 ? " is" : "s are"} allowed.` : "",
      duplicateKeys.size < candidates.length + uploads.length ? "Duplicate files were skipped." : "",
    ].filter(Boolean);

    if (messages.length) setUploadError(messages.join(" "));
    if (!accepted.length) return;

    setUploads((previous) => [
      ...previous,
      ...accepted.map((file) => ({
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
        status: "pending" as const,
        progress: 0,
      })),
    ]);
  }, [uploads.length]);

  const removeUpload = useCallback((index: number) => {
    setUploads((previous) => {
      const item = previous[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return previous.filter((_, itemIndex) => itemIndex !== index);
    });
  }, []);

  const uploadAll = async () => {
    if (!uploads.length) return [] as string[];
    setUploading(true);
    setUploadError(null);
    const urls: string[] = [];
    let failed = false;

    for (let index = 0; index < uploads.length; index += 1) {
      const item = uploads[index];
      if (!item) continue;
      if (item.status === "success" && item.result) {
        urls.push(item.result.url);
        continue;
      }

      setUploads((previous) => previous.map((upload, uploadIndex) => (
        uploadIndex === index ? { ...upload, status: "uploading", progress: 0 } : upload
      )));

      try {
        const result = await uploadMedia(item.file, "commission-reference", undefined, (progress) => {
          setUploads((previous) => previous.map((upload, uploadIndex) => (
            uploadIndex === index ? { ...upload, progress: progress.percentage } : upload
          )));
        });
        setUploads((previous) => previous.map((upload, uploadIndex) => (
          uploadIndex === index ? { ...upload, status: "success", progress: 100, result } : upload
        )));
        urls.push(result.url);
      } catch (error) {
        const message = error instanceof UploadError ? error.message : "Upload failed. Try removing and adding the file again.";
        failed = true;
        setUploads((previous) => previous.map((upload, uploadIndex) => (
          uploadIndex === index ? { ...upload, status: "error", error: message } : upload
        )));
        setUploadError(message);
      }
    }

    setUploading(false);
    return failed ? [] : urls;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!validateStep(3)) {
      setStep(3);
      focusFirstError(errors);
      window.setTimeout(() => stepHeadingRef.current?.focus(), 0);
      return;
    }

    const urls = await uploadAll();
    if (uploadError || (uploads.length > 0 && urls.length !== uploads.length)) {
      setFormError(uploadError || "Some files did not upload. Remove the failed files and try again.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          discord: discord.trim(),
          email: email.trim() || undefined,
          description: description.trim(),
          budget: budget.trim() || undefined,
          deadline: deadline.trim() || undefined,
          references: urls.length ? urls.join("\n") : references.trim() || undefined,
          notes: notes.trim() || undefined,
          commission_type: commissionType,
        }),
      });

      if (!response.ok) throw new Error("Request failed");
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError("Failed to send your request. Please try again or message me on Discord.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-[var(--accent-2)]/10" />
        <div className="relative success-animation">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-white">Request received</h3>
          <p className="mx-auto max-w-md text-[var(--text-secondary)]">
            I will review your request and get back to you on Discord or email within 24 to 48 hours.
          </p>
          <Link href="/" className="btn-primary mt-8 inline-flex">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] md:p-8" noValidate>
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[var(--accent-cosmic)] opacity-[0.06] blur-[80px]" />
      <div className="relative">
        <div className="mb-7 flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Commission Request</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">A short, guided brief for your avatar project.</p>
          </div>
        </div>

        <StepNav current={step} onStep={(nextStep) => {
          if (nextStep <= step) goToStep(nextStep);
        }} />

        {formError && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4 text-sm text-[var(--danger)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div key={step} className="form-step-enter">
          {step === 0 && (
            <div>
              <h3 ref={stepHeadingRef} tabIndex={-1} className="heading-md mb-5 text-white outline-none">Tell me about you</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input
                  id={nameId}
                  ref={(element) => { fieldRefs.current.name = element; }}
                  label="Name"
                  hint="What should I call you?"
                  placeholder="e.g. Alex"
                  autoComplete="name"
                  value={name}
                  error={errors.name}
                  onChange={(event) => { setName(event.target.value); setErrors((current) => ({ ...current, name: undefined })); }}
                  onBlur={() => validateStep(0)}
                />
                <Input
                  id={discordId}
                  ref={(element) => { fieldRefs.current.discord = element; }}
                  label="Discord"
                  hint="Your current Discord username"
                  placeholder="e.g. BlueyBarks"
                  autoComplete="off"
                  value={discord}
                  error={errors.discord}
                  onChange={(event) => { setDiscord(event.target.value); setErrors((current) => ({ ...current, discord: undefined })); }}
                  onBlur={() => validateStep(0)}
                />
                <Input
                  id={emailId}
                  ref={(element) => { fieldRefs.current.email = element; }}
                  label="Email"
                  hint="Optional, in case Discord changes"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  value={email}
                  error={errors.email}
                  onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })); }}
                  onBlur={() => validateStep(0)}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 ref={stepHeadingRef} tabIndex={-1} className="heading-md mb-5 text-white outline-none">Shape the project</h3>
              <div className="mb-5">
                <label htmlFor={typeId} className={`mb-2 block text-xs font-semibold ${errors.commissionType ? "text-[var(--danger)]" : "text-[var(--text-secondary)]"}`}>Commission type</label>
                <select
                  id={typeId}
                  ref={(element) => { fieldRefs.current.commissionType = element; }}
                  value={commissionType}
                  aria-invalid={Boolean(errors.commissionType)}
                  onChange={(event) => {
                    setCommissionType(event.target.value as CommissionType);
                    setErrors((current) => ({ ...current, commissionType: undefined }));
                  }}
                  className={`field ${errors.commissionType ? "error" : ""}`}
                >
                  <option value="">Select a service</option>
                  <option value="avatar">Avatar creation or overhaul</option>
                  <option value="texture">Texture and material work</option>
                  <option value="editing">Avatar editing or optimisation</option>
                  <option value="other">Something else</option>
                </select>
                {errors.commissionType && <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--danger)]"><AlertCircle className="h-3.5 w-3.5" /> {errors.commissionType}</p>}
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input
                  id={budgetId}
                  ref={(element) => { fieldRefs.current.budget = element; }}
                  label="Budget"
                  hint="A range is fine"
                  placeholder="e.g. £30–£50"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                />
                <Input
                  id={deadlineId}
                  ref={(element) => { fieldRefs.current.deadline = element; }}
                  label="Deadline"
                  hint="Optional target date"
                  placeholder="e.g. Within 2 weeks"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                />
              </div>
              <div className="mt-5">
                <Textarea
                  id={descId}
                  ref={(element) => { fieldRefs.current.description = element; }}
                  label="Project description"
                  hint="What are you imagining? Include style, platform, and must-haves."
                  placeholder="Describe the avatar, edit, or texture work..."
                  rows={6}
                  value={description}
                  error={errors.description}
                  onChange={(event) => { setDescription(event.target.value); setErrors((current) => ({ ...current, description: undefined })); }}
                  onBlur={() => validateStep(1)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 ref={stepHeadingRef} tabIndex={-1} className="heading-md mb-5 text-white outline-none">Add the details</h3>
              <div className="space-y-5">
                <Textarea
                  id={refsId}
                  label="Reference links"
                  hint="Optional links to moodboards, bases, or examples"
                  placeholder="Paste links here..."
                  rows={3}
                  value={references}
                  onChange={(event) => setReferences(event.target.value)}
                />
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">Reference uploads</label>
                  <UploadZone onAdd={addFiles} disabled={uploading || uploads.length >= MAX_UPLOADS} />
                  {uploadError && <p role="alert" className="mt-2 flex items-start gap-2 text-xs text-[var(--danger)]"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {uploadError}</p>}
                  {uploads.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {uploads.map((item, index) => (
                        <UploadPreview key={`${item.file.name}-${item.file.size}-${item.file.lastModified}`} item={item} disabled={uploading} onRemove={() => removeUpload(index)} />
                      ))}
                    </div>
                  )}
                </div>
                <Textarea
                  id={notesId}
                  label="Extra notes"
                  hint="Platform, asset details, or anything else I should know"
                  placeholder="PC or Quest, base name, special requests..."
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 ref={stepHeadingRef} tabIndex={-1} className="heading-md mb-5 text-white outline-none">Review and confirm</h3>
              <dl className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 text-sm md:grid-cols-2">
                <div><dt className="text-[var(--text-dim)]">Name</dt><dd className="mt-0.5 font-semibold text-white">{name || "—"}</dd></div>
                <div><dt className="text-[var(--text-dim)]">Discord</dt><dd className="mt-0.5 font-semibold text-white">{discord || "—"}</dd></div>
                <div><dt className="text-[var(--text-dim)]">Email</dt><dd className="mt-0.5 font-semibold text-white">{email || "Not provided"}</dd></div>
                <div><dt className="text-[var(--text-dim)]">Type</dt><dd className="mt-0.5 capitalize font-semibold text-white">{commissionType || "—"}</dd></div>
                <div className="md:col-span-2"><dt className="text-[var(--text-dim)]">Project</dt><dd className="mt-1 whitespace-pre-wrap text-[var(--text-secondary)]">{description || "—"}</dd></div>
                {(budget || deadline) && (
                  <>
                    {budget && <div><dt className="text-[var(--text-dim)]">Budget</dt><dd className="mt-0.5 font-semibold text-white">{budget}</dd></div>}
                    {deadline && <div><dt className="text-[var(--text-dim)]">Deadline</dt><dd className="mt-0.5 font-semibold text-white">{deadline}</dd></div>}
                  </>
                )}
                <div className="md:col-span-2"><dt className="text-[var(--text-dim)]">Files</dt><dd className="mt-1 text-[var(--text-secondary)]">{uploads.length ? `${uploads.length} file${uploads.length === 1 ? "" : "s"} attached` : "No files attached"}</dd></div>
              </dl>
              <div className="space-y-3">
                <CheckboxField id="agreed" checked={agreed} onChange={(value) => { setAgreed(value); setErrors((current) => ({ ...current, agreed: undefined })); }} error={errors.agreed}>
                  I have read and agree to the <Link href="/tos" className="font-semibold text-[var(--accent)] underline underline-offset-4">Terms of Service</Link>.
                </CheckboxField>
                <CheckboxField id="ownsAssets" checked={ownsAssets} onChange={(value) => { setOwnsAssets(value); setErrors((current) => ({ ...current, ownsAssets: undefined })); }} error={errors.ownsAssets}>
                  I legally own or have permission to use every asset I supply.
                </CheckboxField>
                <CheckboxField id="adoptableProof" checked={adoptableProof} onChange={(value) => { setAdoptableProof(value); setErrors((current) => ({ ...current, adoptableProof: undefined })); }} error={errors.adoptableProof}>
                  I understand proof of ownership may be requested for adoptable commissions.
                </CheckboxField>
                <CheckboxField id="refundsUnderstood" checked={refundsUnderstood} onChange={(value) => { setRefundsUnderstood(value); setErrors((current) => ({ ...current, refundsUnderstood: undefined })); }} error={errors.refundsUnderstood}>
                  I understand that refunds are limited once work has begun.
                </CheckboxField>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || submitting}
            className="btn-secondary inline-flex items-center gap-2 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <span className="hidden items-center gap-2 text-xs text-[var(--text-dim)] sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" /> Secure commission brief
          </span>
          {step < 3 ? (
            <button type="button" onClick={handleNext} className="btn-primary inline-flex items-center gap-2">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" disabled={submitting || uploading} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
              {submitting || uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending</> : <><Send className="h-4 w-4" /> Submit Request</>}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
