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
  metadataBase: new URL("https://www.blueycomissions.website"),
  title: {
    default: "Bluey's Avatar Commissions",
    template: "%s | Bluey's Commissions",
  },
  description: "I create and customise VRChat avatars using Blender and Unity. Around 2 years of experience.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Bluey's Avatar Commissions",
    description: "I create and customise VRChat avatars using Blender and Unity. Around 2 years of experience.",
    url: "https://www.blueycomissions.website",
    siteName: "Bluey's Commissions",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Bluey's Avatar Commissions - VRChat Avatar Commissions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bluey's Avatar Commissions",
    description: "I create and customise VRChat avatars using Blender and Unity. Around 2 years of experience.",
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
        <SpaceParticles count={40} />
        {children}
      </body>
    </html>
  );
}
