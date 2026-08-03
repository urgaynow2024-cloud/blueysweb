"use client";

import { useId, useState } from "react";
import { CheckCircle2, Send, Paperclip, AlertCircle, Check, ShieldCheck } from "lucide-react";

export default function ContactCommissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [ownsAssets, setOwnsAssets] = useState(false);
  const [fbxProof, setFbxProof] = useState(false);
  const [refundsUnderstood, setRefundsUnderstood] = useState(false);
  const nameId = useId();
  const discordId = useId();
  const descId = useId();
  const budgetId = useId();
  const deadlineId = useId();
  const refsId = useId();
  const notesId = useId();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);

    if (!agreed || !ownsAssets) {
      setError(true);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name"),
      discord: formData.get("discord"),
      description: formData.get("description"),
      budget: formData.get("budget"),
      deadline: formData.get("deadline"),
      references: formData.get("references"),
      notes: formData.get("notes"),
      agreed,
      owns_assets: ownsAssets,
      fbx_proof: fbxProof,
      refunds_understood: refundsUnderstood,
    };

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

  if (submitted) {
    return (
      <div className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-10 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-[var(--accent-2)]/10" />
        <div className="relative">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-2xl text-[var(--accent)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-white">Request received</h3>
          <p className="mx-auto max-w-md text-[var(--text-secondary)]">
            I&rsquo;ll review your request and get back to you on Discord or email within 24&ndash;48 hours.
          </p>
          <a href="/" className="btn-primary mt-8 inline-flex">Back to Home</a>
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
          {(!agreed || !ownsAssets)
            ? "You must agree to the Terms of Service and confirm asset ownership before submitting."
            : "Failed to send request. Please try again or contact me directly on Discord."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor={nameId} className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
              Name <span className="text-[var(--danger)]">*</span>
            </label>
            <input id={nameId} type="text" name="name" required placeholder="Your name" className="field" />
          </div>
          <div>
            <label htmlFor={discordId} className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
              Discord <span className="text-[var(--danger)]">*</span>
            </label>
            <input id={discordId} type="text" name="discord" required placeholder="e.g. username" className="field" />
          </div>
        </div>

        <div>
          <label htmlFor={descId} className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
            Avatar Information <span className="text-[var(--danger)]">*</span>
          </label>
          <textarea id={descId} name="description" required rows={4} placeholder="Describe what you want done..." className="field resize-y" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor={budgetId} className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">Budget</label>
            <input id={budgetId} type="text" name="budget" placeholder="e.g. £30-£50" className="field" />
          </div>
          <div>
            <label htmlFor={deadlineId} className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">Deadline</label>
            <input id={deadlineId} type="text" name="deadline" placeholder="e.g. Within 2 weeks" className="field" />
          </div>
        </div>

        <div>
          <label htmlFor={refsId} className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">Reference Uploads</label>
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-5 py-7 text-center text-sm text-[var(--text-dim)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-secondary)]">
            <Paperclip className="h-4 w-4" />
            Drop files or paste links
          </div>
          <textarea id={refsId} name="references" rows={3} placeholder="Paste image/video links..." className="field resize-y mt-3" />
        </div>

        <div>
          <label htmlFor={notesId} className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">Notes</label>
          <textarea id={notesId} name="notes" rows={3} placeholder="Platform, special requests..." className="field resize-y" />
        </div>

        {/* Agreement Checkboxes */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            Agreement
          </h3>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <span>I have read and agree to the <a href="/tos" className="text-[var(--accent)] hover:underline">Terms of Service</a>.</span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={ownsAssets}
              onChange={(e) => setOwnsAssets(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <span>I confirm that I legally own or have permission to use every asset supplied.</span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={fbxProof}
              onChange={(e) => setFbxProof(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <span>I understand that proof of ownership may be requested for FBX Mashup commissions.</span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={refundsUnderstood}
              onChange={(e) => setRefundsUnderstood(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <span>I understand that refunds are limited once work has begun.</span>
          </label>
        </div>

        <button type="submit" className="btn-primary w-full !justify-center !py-3.5">
          <Send className="h-4 w-4" />
          Submit Request
        </button>
      </form>
    </div>
  );
}
