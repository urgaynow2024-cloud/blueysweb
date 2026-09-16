import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SpaceParticles from "@/components/SpaceParticles";
import FloatingCommissionCTA from "@/components/FloatingCommissionCTA";
import PageTransition from "@/components/PageTransition";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SpaceParticles />
      <Navbar />
      <main className="relative z-10 flex min-h-screen flex-col pb-safe-mobile md:pb-0">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <FloatingCommissionCTA />
    </>
  );
}
