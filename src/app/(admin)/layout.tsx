import { ToastProvider } from "@/components/admin/Toast";
import { SaveProvider } from "@/components/admin/SaveProvider";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <SaveProvider>{children}</SaveProvider>
    </ToastProvider>
  );
}
