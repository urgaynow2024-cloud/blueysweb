"use client";

import Link from "next/link";
import { getNavigationItems } from "@/lib/db";
import { Home, Scissors, Box, Package, Clock, Tag, ShoppingCart, HelpCircle, Star, Phone, Mail, Send } from "lucide-react";
import { useState, useEffect } from "react";

const linkIcons: Record<string, React.ElementType> = {
  "/": Home,
  "/services": Scissors,
  "/fbx-mashups": Box,
  "/portfolio": Package,
  "/process": Clock,
  "/pricing": Tag,
  "/before-ordering": ShoppingCart,
  "/faq": HelpCircle,
  "/reviews": Star,
  "/contact": Phone,
};

export default function Footer() {
  const [navItems, setNavItems] = useState<any[]>([]);
  const [navLoaded, setNavLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getNavigationItems();
        if (data && data.length > 0) {
          setNavItems(data);
        } else {
          setNavItems([
            { href: "/services", label: "Services", is_visible: true },
            { href: "/fbx-mashups", label: "FBX Mashups", is_visible: true },
            { href: "/portfolio", label: "Portfolio", is_visible: true },
            { href: "/process", label: "Process", is_visible: true },
            { href: "/pricing", label: "Pricing", is_visible: true },
            { href: "/faq", label: "FAQ", is_visible: true },
          ]);
        }
      } catch (e) {
        console.error("Failed to load navigation:", e);
        setNavItems([
          { href: "/services", label: "Services", is_visible: true },
          { href: "/fbx-mashups", label: "FBX Mashups", is_visible: true },
          { href: "/portfolio", label: "Portfolio", is_visible: true },
          { href: "/process", label: "Process", is_visible: true },
          { href: "/pricing", label: "Pricing", is_visible: true },
          { href: "/faq", label: "FAQ", is_visible: true },
        ]);
      } finally {
        setNavLoaded(true);
      }
    }
    load();
  }, []);

  const displayNav = navItems.filter((l: any) => l.is_visible !== false);
  const exploreLinks = displayNav.filter((l: any) => l.href !== "/contact");
  const supportLinks = [
    { href: "/contact", label: "Contact", icon: Phone },
    { href: "/before-ordering", label: "Before Ordering", icon: ShoppingCart },
    { href: "/tos", label: "Terms of Service", icon: Mail },
    { href: "https://discord.com/", label: "Discord", icon: Send, external: true },
  ];

  return (
    <footer className="relative mt-20 border-t border-[var(--border)] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-[var(--accent)] opacity-[0.06] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 group font-display">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-[#05070a] text-sm font-bold shadow-lg shadow-[var(--accent)]/15 group-hover:shadow-[var(--accent)]/30 transition-shadow">
                B
              </span>
              Bluey<span className="text-[var(--accent)]">&apos;s</span>
            </Link>
            <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs">
              Custom VRChat avatars crafted in Blender &amp; Unity. FBX mashups, avatar edits,
              clothing creation, and performance optimisation with care.
            </p>
          </div>

          <div className="md:justify-self-center">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)] mb-5">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              {exploreLinks.map((l: any) => {
                const Icon = linkIcons[l.href];
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-all hover:translate-x-1"
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="md:justify-self-end">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)] mb-5">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              {supportLinks.map((l) => {
                const Icon = l.icon;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-all hover:translate-x-1"
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      prefetch={false}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-5 text-sm text-[var(--text-dim)]">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-[#05070a] text-xs font-bold">
              B
            </span>
            <span suppressHydrationWarning>&copy; {new Date().getFullYear()} Bluey&apos;s Avatar Commissions</span>
          </div>
          <div className="flex gap-7">
            <Link href="/tos" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}