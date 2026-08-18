"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ShoppingCart,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Lock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

import { getAdoptableById, getAdoptableGalleryImages } from "@/lib/db";
import { isAgeVerified } from "@/components/AgeVerifier";
import AgeVerifier from "@/components/AgeVerifier";
import type { Adoptable, AdoptableGalleryImage } from "@/types/adoptables";
import Reveal from "@/components/ui/Reveal";

const STATUS_CONFIG = {
  available: {
    label: "Available",
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  reserved: {
    label: "Reserved",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  sold: {
    label: "Sold",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
} as const;

export default function AdoptablePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [adoptable, setAdoptable] = useState<Adoptable | null>(null);
  const [galleryImages, setGalleryImages] = useState<AdoptableGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    setAgeVerified(isAgeVerified());
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [adoptableData, galleryData] = await Promise.all([
          getAdoptableById(id),
          getAdoptableGalleryImages(id),
        ]);
        if (!adoptableData) {
          setAdoptable(null);
          setLoading(false);
          return;
        }
        setAdoptable(adoptableData);
        setGalleryImages(galleryData || []);

        if (
          adoptableData.availability !== "available" &&
          (!adoptableData.nsfw_available || ageVerified)
        ) {
          // no-op
        }
      } catch (e) {
        console.error("Failed to load adoptable:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, ageVerified]);

  if (loading) {
    return (
      <div className="relative">
        <div className="container page">
          <div className="animate-pulse">
            <div className="mb-6 h-4 w-24 rounded bg-[var(--border)]" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="aspect-[4/3] rounded-2xl bg-[var(--border)]" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded bg-[var(--border)]" />
                <div className="h-4 w-1/2 rounded bg-[var(--border)]" />
                <div className="h-4 w-full rounded bg-[var(--border)]" />
                <div className="h-4 w-3/4 rounded bg-[var(--border)]" />
                <div className="mt-6 h-12 w-48 rounded bg-[var(--border)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!adoptable) {
    return (
      <div className="container page">
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Package className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Adoptable not found</h2>
          <p className="text-[var(--text-secondary)]">This adoptable doesn't exist or is no longer available.</p>
          <Link
            href="/adoptables"
            className="mt-4 btn-secondary inline-flex items-center gap-2"
          >
            Back to Adoptables
          </Link>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[adoptable.availability] || STATUS_CONFIG.available;
  const Icon = cfg.icon;
  const isSold = adoptable.availability === "sold";
  const isReserved = adoptable.availability === "reserved";
  const isAvailable = adoptable.availability === "available";

  const allImages: { url: string; isNsfw: boolean; label: string }[] = [];
  if (adoptable.main_image) {
    allImages.push({ url: adoptable.main_image, isNsfw: false, label: "Main" });
  }
  galleryImages.forEach((img, i) => {
    if (allImages.every((a) => a.url !== img.url)) {
      allImages.push({ url: img.url, isNsfw: !!img.is_nsfw, label: `Image ${i + 1}` });
    }
  });

  const sfwImages = allImages.filter((img) => !img.isNsfw);
  const nsfwImages = allImages.filter((img) => img.isNsfw);

  const visibleImages = ageVerified
    ? allImages
    : sfwImages.length > 0
    ? sfwImages
    : isSold
    ? allImages.slice(0, 1)
    : [];

  const hasNsfwContent =
    adoptable.nsfw_available || nsfwImages.length > 0;

  const handleAgeVerified = () => {
    setAgeVerified(true);
    setShowAgeGate(false);
  };

  const openLightbox = (idx: number) => {
    if (!ageVerified && hasNsfwContent) {
      setShowAgeGate(true);
      return;
    }
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const prevImage = () =>
    setLightboxIndex((lightboxIndex - 1 + visibleImages.length) % visibleImages.length);
  const nextImage = () =>
    setLightboxIndex((lightboxIndex + 1) % visibleImages.length);

  const buyOnDiscord = () => {
    window.open("https://discord.gg/zt48MZm5kD", "_blank", "noopener,noreferrer");
  };

  const InfoSection = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => {
    if (!children) return null;
    return (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-2">
          {label}
        </h3>
        <div className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <div className="container page">
        {/* Back link */}
        <Link
          href="/adoptables"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Adoptables
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated]">
              {visibleImages.length > 0 ? (
                <img
                  src={visibleImages[lightboxIndex < visibleImages.length ? lightboxIndex : 0]?.url}
                  alt={adoptable.title}
                  className={`h-full w-full object-cover ${
                    hasNsfwContent && !ageVerified ? "blur-[4px] grayscale" : ""
                  }`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-16 w-16 text-[var(--text-dim)]" />
                </div>
              )}

              {/* Status badge */}
              <div className="absolute top-4 right-4 z-10">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.color} ${cfg.bg} ${cfg.border}`}
                >
                  <Icon className="h-3 w-3" />
                  {cfg.label}
                </span>
              </div>

              {/* NSFW badge when not verified */}
              {hasNsfwContent && !ageVerified && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                    <Lock className="h-3 w-3" />
                    NSFW — Age Restricted
                  </span>
                </div>
              )}

              {/* SOLD overlay */}
              {isSold && (
                <div className="adoptable-sold-overlay">
                  <span className="adoptable-sold-text">SOLD</span>
                  <span className="adoptable-sold-subtext">This adoptable has been purchased</span>
                </div>
              )}

              {/* Reserved overlay */}
              {isReserved && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-amber-500/15 backdrop-blur-[2px]">
                  <span className="text-3xl font-black text-amber-400">RESERVED</span>
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {visibleImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {visibleImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => openLightbox(idx)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      idx === lightboxIndex
                        ? "border-[var(--accent)]"
                        : "border-[var(--border)] hover:border-[var(--border-hover)]"
                    }} ${img.isNsfw && !ageVerified ? "blur-[3px]" : ""}`}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="h-full w-full object-cover"
                    />
                    {img.isNsfw && !ageVerified && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Character Info */}
          <div className="space-y-6">
            {/* Title and species */}
            <div>
              <h1 className="display-sm text-white">{adoptable.title}</h1>
              {adoptable.species && (
                <p className="text-sm text-[var(--text-secondary)] mt-1">{adoptable.species}</p>
              )}
            </div>

            {/* Description */}
            {adoptable.description && (
              <InfoSection label="Description">{adoptable.description}</InfoSection>
            )}

            {/* Included items */}
            <InfoSection label="Included Items">{adoptable.included_items}</InfoSection>

            {/* VRChat info */}
            <InfoSection label="VRChat Information">{adoptable.vrchat_info}</InfoSection>

            {/* Rules / License */}
            <InfoSection label="Rules &amp; License">{adoptable.rules_license}</InfoSection>

            {/* Pricing */}
            {(adoptable.sfw_available ||
              adoptable.nsfw_available ||
              adoptable.bundle_available ||
              adoptable.price) && (
              <div className="border-t border-[var(--border)] pt-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                  Pricing
                </h3>

                {adoptable.sfw_available && adoptable.sfw_price && (
                  <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                    <span className="text-sm font-semibold text-white">SFW Version</span>
                    <span className="text-lg font-bold text-[var(--accent)]">
                      {ageVerified || !hasNsfwContent ? adoptable.sfw_price : adoptable.sfw_price}
                    </span>
                  </div>
                )}

                {adoptable.nsfw_available && adoptable.nsfw_price && (
                  <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <Lock className="h-4 w-4 text-red-400" />
                      NSFW Version
                    </span>
                    <span className="text-lg font-bold text-red-400">
                      {ageVerified ? adoptable.nsfw_price : "• • •"}
                    </span>
                  </div>
                )}

                {adoptable.bundle_available && adoptable.bundle_price && (
                  <div className="flex items-center justify-between rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-4 py-3">
                    <span className="text-sm font-semibold text-white">SFW + NSFW Bundle</span>
                    <span className="text-lg font-bold text-[var(--accent)]">
                      {ageVerified ? adoptable.bundle_price : "• • •"}
                    </span>
                  </div>
                )}

                {!adoptable.sfw_available &&
                  !adoptable.nsfw_available &&
                  !adoptable.bundle_available &&
                  adoptable.price && (
                    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                      <span className="text-sm font-semibold text-white">Price</span>
                      <span className="text-lg font-bold text-white">{adoptable.price}</span>
                    </div>
                  )}
              </div>
            )}

            {/* Purchase actions */}
            <div className="border-t border-[var(--border)] pt-6">
              {isAvailable && (
                <button
                  onClick={buyOnDiscord}
                  className="btn-primary w-full !py-3 !text-sm inline-flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Adopt via Discord
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
              {isReserved && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-center">
                  <Clock className="mx-auto mb-2 h-5 w-5 text-amber-400" />
                  <p className="font-semibold text-amber-400">This adoptable is reserved.</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    It is temporarily unavailable while a reservation is pending.
                  </p>
                </div>
              )}
              {isSold && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-center">
                  <XCircle className="mx-auto mb-2 h-5 w-5 text-red-400" />
                  <p className="font-semibold text-red-400">This adoptable has been sold.</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    It is no longer available for adoption.
                  </p>
                </div>
              )}

              {!ageVerified && hasNsfwContent && isAvailable && (
                <button
                  onClick={() => setShowAgeGate(true)}
                  className="mt-3 btn-secondary w-full !py-2 !px-4 !text-sm inline-flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Verify Age for NSFW Content
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Age Gate */}
      {showAgeGate && <AgeVerifier onVerified={handleAgeVerified} />}

      {/* Image Lightbox */}
      {lightboxOpen && visibleImages.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${lightboxIndex + 1} of ${visibleImages.length}`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <div className="relative flex max-h-[95vh] max-w-[95vw] items-center justify-center">
            <img
              src={visibleImages[lightboxIndex]?.url}
              alt={adoptable.title}
              className="max-h-[88vh] max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl shadow-black/60"
            />

            {visibleImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:left-5"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:right-5"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <button
              onClick={closeLightbox}
              className="absolute -top-2 right-0 grid h-10 w-10 translate-x-2 -translate-y-2 place-items-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:-top-3 md:right-2"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-2 text-sm text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              {lightboxIndex + 1} / {visibleImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
