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

export function calculateAge(birthday: string): number {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function verifyAge(birthday: string): boolean {
  const age = calculateAge(birthday);
  return age >= 18;
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
  const [birthday, setBirthday] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!birthday) {
      setError("Please enter your birthday");
      return;
    }

    if (!agreed) {
      setError("You must confirm you are an adult");
      return;
    }

    const age = calculateAge(birthday);
    if (age < 18) {
      setError("You must be 18 or older to access this content");
      return;
    }

    setAgeVerified();
    onVerified();
  }

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
              Date of Birth <span className="text-[#ff6b6b]">*</span>
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="field"
              required
            />
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
