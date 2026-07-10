"use client";

import { useId, useState } from "react";

export default function ContactCommissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const nameId = useId();
  const discordId = useId();
  const descId = useId();
  const budgetId = useId();
  const deadlineId = useId();
  const refsId = useId();
  const notesId = useId();

  if (submitted) {
    return (
      <div className="glass rounded-2xl p-10 text-center border border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-[var(--accent-2)]/8" />
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 grid place-items-center text-2xl text-[var(--accent)]">
            ✓
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Request received</h3>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            I&rsquo;ll review your request and get back to you on Discord or email
            within 24-48 hours.
          </p>
          <a href="/" className="btn-primary mt-8 inline-flex">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-7 md:p-10 border border-[var(--border)]">
      <h2 className="text-xl font-bold text-white mb-1">Commission Request</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-7">
        Tell me about the avatar work you need
      </p>
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor={nameId} className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
              Name <span className="text-[#ff6b6b]">*</span>
            </label>
            <input
              id={nameId}
              type="text"
              name="name"
              required
              placeholder="Your name"
              className="field"
            />
          </div>
          <div>
            <label htmlFor={discordId} className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
              Discord <span className="text-[#ff6b6b]">*</span>
            </label>
            <input
              id={discordId}
              type="text"
              name="discord"
              required
              placeholder="e.g. username#0000"
              className="field"
            />
          </div>
        </div>

        <div>
          <label htmlFor={descId} className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Avatar Information <span className="text-[#ff6b6b]">*</span>
          </label>
          <textarea
            id={descId}
            name="description"
            required
            rows={4}
            placeholder="Describe what you want done..."
            className="field resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor={budgetId} className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
              Budget
            </label>
            <input
              id={budgetId}
              type="text"
              name="budget"
              placeholder="e.g. £30-£50"
              className="field"
            />
          </div>
          <div>
            <label htmlFor={deadlineId} className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
              Deadline
            </label>
            <input
              id={deadlineId}
              type="text"
              name="deadline"
              placeholder="e.g. Within 2 weeks"
              className="field"
            />
          </div>
        </div>

        <div>
          <label htmlFor={refsId} className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Reference Uploads
          </label>
          <div className="w-full px-5 py-7 rounded-2xl bg-[var(--bg)] border border-dashed border-[var(--border)] text-center text-[var(--text-dim)] text-sm cursor-pointer hover:border-[var(--accent)] hover:text-[var(--text-secondary)] transition-all">
            📎 Drop files or paste links
          </div>
          <textarea
            id={refsId}
            name="references"
            rows={3}
            placeholder="Paste image/video links..."
            className="field resize-y mt-3"
          />
        </div>

        <div>
          <label htmlFor={notesId} className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Notes
          </label>
          <textarea
            id={notesId}
            name="notes"
            rows={3}
            placeholder="Platform, special requests..."
            className="field resize-y"
          />
        </div>

        <button type="submit" className="w-full btn-primary !justify-center !py-3.5">
          Submit Request
        </button>
      </form>
    </div>
  );
}
