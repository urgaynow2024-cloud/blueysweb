"use client";

import { useState } from "react";
import { ShieldCheck, AlertCircle, Lock } from "lucide-react";

const AGE_VERIFIED_KEY = "bluey_age_verified";
const AGE_VERIFIED_DATE_KEY = "bluey_age_verified_date";

export function isAgeVerified(): boolean {
  if (typeof window === "undefined") return false;
  const verified = localStorage.getItem(AGE_VERIFIED_KEY);
  const date = localStorage.getItem(AGE_VERIFIED_DATE_KEY);
  if (!verified || !date) return false;

  const verifiedDate = new Date(date);
  const now = new Date();
  const daysSinceVerification = (now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceVerification > 30) {
    localStorage.removeItem(AGE_VERIFIED_KEY);
    localStorage.removeItem(AGE_VERIFIED_DATE_KEY);
    return false;
  }

  return verified === "true";
}

export function setAgeVerified() {
  if (typeof window !== "undefined") {
    localStorage.setItem(AGE_VERIFIED_KEY, "true");
    localStorage.setItem(AGE_VERIFIED_DATE_KEY, new Date().toISOString());
  }
}

export function clearAgeVerification() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AGE_VERIFIED_KEY);
    localStorage.removeItem(AGE_VERIFIED_DATE_KEY);
  }
}

export default function AgeVerifier({ onVerified }: { onVerified: () => void }) {
  const [age, setAge] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedAge = parseInt(age, 10);

    if (!age || isNaN(parsedAge)) {
      setError("Please enter your age");
      return;
    }

    if (!agreed) {
      setError("You must confirm you are an adult");
      return;
    }

    if (parsedAge < 18) {
      setError("You must be 18 or older to access this content");
      return;
    }

    setAgeVerified();
    onVerified();
  }

  const quickAges = [18, 19, 20, 21, 25, 30];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Age verification"
        className="relative w-full max-w-md overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-8 scale-in"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-[var(--accent-2)]/8" />
        <div className="relative">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Age Verification</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            This section contains adult content. You must be 18 or older to continue.
          </p>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
                How old are you? <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="18"
                max="120"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="field text-center text-lg"
                required
              />
              <p className="mt-1.5 text-xs text-[var(--text-dim)]">Examples: 18, 21, 25, 30...</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">Quick select</label>
              <div className="flex flex-wrap gap-2">
                {quickAges.map((quickAge) => (
                  <button
                    key={quickAge}
                    type="button"
                    onClick={() => setAge(String(quickAge))}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                      age === String(quickAge)
                        ? "bg-[var(--accent)] text-[#04060a]"
                        : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-white"
                    }`}
                  >
                    {quickAge}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="adult-confirm"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[var(--border)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                required
              />
              <label htmlFor="adult-confirm" className="text-sm text-[var(--text-secondary)]">
                I confirm that I am 18 years of age or older and wish to view adult content.
              </label>
            </div>

            <button type="submit" className="btn-primary w-full !py-3">
              <ShieldCheck className="h-4 w-4" />
              Enter Adult Section
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
