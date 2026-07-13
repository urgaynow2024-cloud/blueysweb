import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="relative z-10 flex min-h-screen flex-col pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      {/* Mobile sticky CTA */}
      <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
        <a
          href="/contact"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-4)] px-6 py-3.5 font-bold text-[#04060a] shadow-2xl shadow-[var(--accent)]/30 transition-all active:scale-[0.98]"
        >
          Commission Me
        </a>
      </div>
    </>
  );
}
