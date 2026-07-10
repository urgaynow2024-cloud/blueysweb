"use client";

import { useState } from "react";

export default function ClientReviewForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: (formData.get("name") as string).trim(),
      avatar: (formData.get("avatar") as string).trim() || "🎭",
      text: (formData.get("text") as string).trim(),
      project: (formData.get("project") as string).trim(),
    };

    if (!data.name || !data.text) {
      setError(true);
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
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
      <div className="glass rounded-2xl p-8 text-center border border-[var(--border)]">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 grid place-items-center text-xl text-[var(--accent)]">
          ✓
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Review submitted</h3>
        <p className="text-sm text-[var(--text-secondary)]">Thanks for your feedback! It will appear on the site shortly.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-7 md:p-8 border border-[var(--border)]">
      <h2 className="text-lg font-bold text-white mb-1">Leave a Review</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Had a commission with me? Share your experience.</p>
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          Please fill in your name and review text.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Your name *</label>
            <input name="name" required placeholder="e.g. VRC Fan" className="field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Emoji / Avatar</label>
            <input name="avatar" placeholder="🎭" className="field" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Commission type</label>
          <input name="project" placeholder="e.g. Avatar Customisation" className="field" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Your review *</label>
          <textarea name="text" required rows={4} placeholder="What was your experience like?" className="field resize-y" />
        </div>
        <button type="submit" className="w-full btn-primary !justify-center !py-3">Submit Review</button>
      </form>
    </div>
  );
}
