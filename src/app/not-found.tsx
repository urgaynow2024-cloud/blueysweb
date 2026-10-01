import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <div className="relative text-center">
        <p className="display-xl text-white">404</p>
        <h1 className="heading-sm mt-4 text-white">Looks like this page wandered off.</h1>
        <p className="mx-auto mt-3 max-w-md text-[var(--text-secondary)]">
          The page you were looking for doesn&rsquo;t exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Back Home
          </Link>
          <Link href="/commission" className="btn-secondary inline-flex items-center gap-2">
            Start a Commission
          </Link>
        </div>
      </div>
    </main>
  );
}