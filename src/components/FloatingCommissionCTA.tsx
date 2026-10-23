"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function FloatingCommissionCTA() {
  const pathname = usePathname();
  const isFormRoute = pathname === siteConfig.commissionPath || pathname === "/contact";

  if (isFormRoute) return null;

  return (
    <Link
      href={siteConfig.commissionPath}
      className="floating-commission-cta"
      aria-label="Start a commission"
    >
      <Zap className="h-4 w-4" aria-hidden="true" />
      <span>Commission Me</span>
    </Link>
  );
}
