"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Technical detail stays server-side/client console only. Never surface
    // raw database or framework errors to visitors.
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <div className="relative text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="heading-sm mt-6 text-white">Something went wrong.</h1>
        <p className="mx-auto mt-3 max-w-md text-[var(--text-secondary)]">
          Please try again. If the problem continues, get in touch and let me know.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary inline-flex items-center gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
          <Link href="/" className="btn-secondary inline-flex items-center gap-2">
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}