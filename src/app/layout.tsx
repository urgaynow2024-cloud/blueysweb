import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className="min-h-full bg-[var(--bg)] text-[var(--text)]">
        <div className="bg-mesh" />
        <div className="bg-noise" />
        {children}
      </body>
    </html>
  );
}
