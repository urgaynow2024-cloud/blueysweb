import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[130px]" />

      <div className="text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--accent)]">
          <Wrench className="h-10 w-10" />
        </div>
        <h1 className="display-lg text-white">Under Maintenance</h1>
        <p className="lead mx-auto mt-4 max-w-md">
          The website is currently undergoing maintenance. Please check back soon.
        </p>
      </div>
    </div>
  );
}
