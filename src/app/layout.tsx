import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Bluey's Avatar Commissions",
    template: "%s | Bluey's Commissions",
  },
  description: "I create and customise VRChat avatars using Blender and Unity. Around 2 years of experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} style={{ colorScheme: "dark" }}>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)] pb-20 md:pb-0">
        <div className="bg-mesh" />
        <div className="bg-noise" />
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
        {/* Mobile sticky CTA */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <a
            href="/contact"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-4)] text-[#04060a] px-6 py-3.5 rounded-2xl font-bold text-base shadow-2xl shadow-[var(--accent)]/30 transition-all active:scale-[0.98]"
          >
            Commission Me
          </a>
        </div>
      </body>
    </html>
  );
}
