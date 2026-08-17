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
      <SpaceParticles count={8} />
      <SaveProvider>{children}</SaveProvider>
    </ToastProvider>
  );
}
