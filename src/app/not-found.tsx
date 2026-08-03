import { Home, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[130px]" />

      <div className="text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-dim)]">
          <SearchX className="h-10 w-10" />
        </div>
        <h1 className="display-lg text-white">404</h1>
        <p className="lead mx-auto mt-4 max-w-md">
          This page doesn&rsquo;t exist or has been moved. Let&rsquo;s get you back to the studio.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
