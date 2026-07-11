"use client";

import { useState, useEffect } from "react";

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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-2">Age Verification</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          This section contains adult content. You must be 18 or older to continue.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
              How old are you? <span className="text-[#ff6b6b]">*</span>
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
            <p className="text-xs text-[var(--text-dim)] mt-1.5">
              Examples: 18, 21, 25, 30...
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
              Quick select
            </label>
            <div className="flex flex-wrap gap-2">
              {quickAges.map((quickAge) => (
                <button
                  key={quickAge}
                  type="button"
                  onClick={() => setAge(String(quickAge))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    age === String(quickAge)
                      ? "bg-[var(--accent)] text-[#05070a]"
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
              className="mt-1 w-4 h-4 rounded border-[var(--border)] bg-[var(--bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
              required
            />
            <label htmlFor="adult-confirm" className="text-sm text-[var(--text-secondary)]">
              I confirm that I am 18 years of age or older and wish to view adult content.
            </label>
          </div>

          <button type="submit" className="w-full btn-primary !py-3">
            Enter Adult Section
          </button>
        </form>
      </div>
    </div>
  );
}
