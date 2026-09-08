import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SpaceParticles from "@/components/SpaceParticles";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.comisioner.com"),
  title: {
    default: "Comisioner",
    template: "%s | Comisioner",
  },
  description: "A premium creator studio for VRChat avatars — handcrafted with care in Blender & Unity.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Comisioner",
    description: "A premium creator studio for VRChat avatars — handcrafted with care in Blender & Unity.",
    url: "https://www.comisioner.com",
    siteName: "Comisioner",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Comisioner - Premium VRChat Avatar Commissions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comisioner",
    description: "A premium creator studio for VRChat avatars — handcrafted with care in Blender & Unity.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`} style={{ colorScheme: "dark" }}>
      <body className="min-h-full bg-[var(--bg)] text-[var(--text)]">
        <div className="bg-mesh" />
        <div className="bg-nebula" />
        <div className="bg-noise" />
        {children}
      </body>
    </html>
  );
}
