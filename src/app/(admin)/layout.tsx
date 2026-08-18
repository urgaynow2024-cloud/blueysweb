import { ToastProvider } from "@/components/admin/Toast";
import { SaveProvider } from "@/components/admin/SaveProvider";
import SpaceParticles from "@/components/SpaceParticles";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <SpaceParticles count={12} />
      <div className="pointer-events-none fixed inset-0 bg-cosmic-fog" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 bg-noise" aria-hidden="true" />
      <SaveProvider>{children}</SaveProvider>
    </ToastProvider>
  );
}
