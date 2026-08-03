"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[130px]" />

          <div className="text-center">
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--danger)]">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h1 className="display-lg text-white">Something went wrong</h1>
            <p className="lead mx-auto mt-4 max-w-md">
              An unexpected error occurred. Please try again or go back to the homepage.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={reset}
                className="btn-primary inline-flex items-center gap-2"
              >
                Try Again
              </button>
              <Link href="/" className="btn-secondary inline-flex items-center gap-2">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
