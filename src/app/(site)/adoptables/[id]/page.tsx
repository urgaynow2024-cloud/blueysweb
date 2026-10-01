"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GitCompare,
  Lock,
  Package,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import {
  getAdoptableById,
  getAdoptableBeforeAfters,
  getAdoptableGalleryImages,
} from "@/lib/db";
import { isAgeVerified } from "@/components/AgeVerifier";
import AgeVerifier from "@/components/AgeVerifier";
import type { Adoptable, AdoptableBeforeAfter, AdoptableGalleryImage } from "@/types/database";
import {
  ADOPTABLE_STATUS_META,
  canPurchase,
  normalizeStatus,
  unavailabilityMessage,
} from "@/lib/adoptables/status";
import { categoryLabel, includedFeatureList } from "@/lib/adoptables/catalog";
import { resolveMediaUrl } from "@/lib/adoptables/images";
import { AdoptableArtwork } from "@/components/adoptables/AdoptableArtwork";
import { StatusBadge } from "@/components/adoptables/StatusBadge";
import { PriceList } from "@/components/adoptables/PriceList";

const DISCORD_URL = "https://discord.gg/zt48MZm5kD";

interface MediaItem {
  url: string;
  path?: string | null;
  isNsfw: boolean;
  label: string;
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-dim)]">
        {title}
      </h2>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
        {children}
      </div>
    </section>
  );
}

function ComparisonPair({ pair }: { pair: AdoptableBeforeAfter }) {
  const before = resolveMediaUrl(pair.before_url, pair.before_path);
  const after = resolveMediaUrl(pair.after_url, pair.after_path);
  if (!before && !after) return null;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
            Before
          </p>
          <div className="aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            {before ? (
              <AdoptableArtwork
                url={before}
                alt="Before"
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover"
                fallbackLabel="Not uploaded"
              />
            ) : (
              <div className="adoptable-artwork-fallback grid h-full w-full place-items-center text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                Not uploaded
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
            After
          </p>
          <div className="aspect-square overflow-hidden rounded-xl border border-[var(--accent)]/30 bg-[var(--bg)]">
            {after ? (
              <AdoptableArtwork
                url={after}
                alt="After"
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover"
                fallbackLabel="Not uploaded"
              />
            ) : (
              <div className="adoptable-artwork-fallback grid h-full w-full place-items-center text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                Not uploaded
              </div>
            )}
          </div>
        </div>
      </div>
      {pair.label && (
        <p className="text-xs text-[var(--text-secondary)]">{pair.label}</p>
      )}
    </div>
  );
}

export default function AdoptableDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [adoptable, setAdoptable] = useState<Adoptable | null>(null);
  const [galleryImages, setGalleryImages] = useState<AdoptableGalleryImage[]>([]);
  const [comparisons, setComparisons] = useState<AdoptableBeforeAfter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    setAgeVerified(isAgeVerified());
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [adoptableData, galleryData, comparisonData] = await Promise.all([
        getAdoptableById(id),
        getAdoptableGalleryImages(id),
        getAdoptableBeforeAfters(id).catch(() => [] as AdoptableBeforeAfter[]),
      ]);

      if (!adoptableData) {
        setAdoptable(null);
        return;
      }
      setAdoptable(adoptableData);
      setGalleryImages(galleryData ?? []);
      setComparisons(comparisonData ?? []);
    } catch (e) {
      console.error("Failed to load adoptable:", e);
      setLoadError("We could not load this adoptable just now.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const status = normalizeStatus(adoptable?.availability);
  const meta = ADOPTABLE_STATUS_META[status];

  const media = useMemo<MediaItem[]>(() => {
    if (!adoptable) return [];
    const items: MediaItem[] = [];
    const seen = new Set<string>();

    const main = resolveMediaUrl(adoptable.main_image, adoptable.main_image_path);
    if (main) {
      items.push({ url: main, path: adoptable.main_image_path, isNsfw: false, label: "Main artwork" });
      seen.add(main);
    }

    for (const img of galleryImages) {
      const url = resolveMediaUrl(img.url, img.path ?? img.storage_path);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      items.push({ url, path: img.path ?? img.storage_path, isNsfw: Boolean(img.is_nsfw), label: "Gallery" });
    }

    return items;
  }, [adoptable, galleryImages]);

  const hasNsfw = Boolean(adoptable?.nsfw_available) || media.some((item) => item.isNsfw);
  const blurAll = hasNsfw && !ageVerified;

  const visibleMedia = useMemo(
    () => (blurAll ? media.map((item) => ({ ...item, isNsfw: true })) : media),
    [media, blurAll],
  );

  const activeIndex = lightbox ?? 0;
  const active = visibleMedia[Math.min(activeIndex, Math.max(0, visibleMedia.length - 1))];

  const features = useMemo(() => (adoptable ? includedFeatureList(adoptable) : []), [adoptable]);
  const purchasable = adoptable ? canPurchase(adoptable.availability) : false;

  const stepLightbox = (delta: number) => {
    if (visibleMedia.length === 0) return;
    setLightbox(
      (prev) => (((prev ?? 0) + delta) % visibleMedia.length + visibleMedia.length) % visibleMedia.length,
    );
  };

  /* --------------------------------------------------------------- States */

  if (loading) {
    return (
      <div className="container page">
        <div className="animate-pulse">
          <div className="skeleton mb-8 h-4 w-28 rounded" />
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="skeleton aspect-square w-full rounded-[var(--r-lg)]" />
            <div className="space-y-4">
              <div className="skeleton h-10 w-2/3 rounded" />
              <div className="skeleton h-4 w-1/3 rounded" />
              <div className="skeleton h-24 w-full rounded-xl" />
              <div className="skeleton h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container page">
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--danger-soft)] text-[var(--danger)]">
            <RefreshCw className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mb-3 text-xl font-semibold text-white">Something went wrong</h1>
          <p className="mb-6 text-sm text-[var(--text-secondary)]">{loadError}</p>
          <button type="button" onClick={() => void load()} className="btn-primary !py-2 !text-sm">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!adoptable) {
    return (
      <div className="container page">
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Package className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mb-3 text-xl font-semibold text-white">Adoptable not found</h1>
          <p className="mb-7 text-sm text-[var(--text-secondary)]">
            This character either does not exist or is not currently published.
          </p>
          <Link href="/adoptables" className="btn-secondary inline-flex items-center gap-2 !py-2 !text-sm">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Adoptables
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="container page">
        <Link
          href="/adoptables"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Adoptables
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ------------------------------------------------------ LEFT: media */}
          <div className="space-y-4">
            <div className="adoptable-glass-panel overflow-hidden">
              <div className="relative aspect-square w-full overflow-hidden sm:aspect-[4/3]">
                {active ? (
                  <>
                    <AdoptableArtwork
                      url={active.url}
                      alt={adoptable.title || "Adoptable artwork"}
                      wrapperClassName="h-full w-full"
                      className={`h-full w-full object-cover ${blurAll ? "blur-[6px] grayscale" : ""}`}
                      loading="eager"
                      fallbackLabel="Artwork could not be loaded"
                    />
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                      <span />
                      <StatusBadge status={status} size="md" className="shadow-lg" />
                    </div>
                    {status === "sold" && (
                      <div className="adoptable-sold-overlay">
                        <span className="adoptable-sold-text">SOLD</span>
                        <span className="adoptable-sold-subtext">
                          This adoptable has already found a home
                        </span>
                      </div>
                    )}
                    {blurAll && (
                      <div className="absolute inset-0 grid place-items-center">
                        <button
                          type="button"
                          onClick={() => setShowAgeGate(true)}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-black/70 px-4 py-2 text-xs font-semibold text-rose-200 backdrop-blur"
                        >
                          <Lock className="h-3.5 w-3.5" aria-hidden />
                          Verify age to view
                        </button>
                      </div>
                    )}
                    {visibleMedia.length > 1 && !blurAll && (
                      <>
                        <button
                          type="button"
                          onClick={() => stepLightbox(-1)}
                          aria-label="Previous image"
                          className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/75"
                        >
                          <ChevronLeft className="h-5 w-5" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => stepLightbox(1)}
                          aria-label="Next image"
                          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/75"
                        >
                          <ChevronRight className="h-5 w-5" aria-hidden />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="adoptable-artwork-fallback flex h-full w-full flex-col items-center justify-center gap-2 px-8 text-center">
                    <Package className="h-9 w-9 text-[var(--text-dim)]" aria-hidden />
                    <p className="text-sm font-semibold text-white">No artwork published yet</p>
                    <p className="max-w-xs text-xs text-[var(--text-secondary)]">
                      This character does not have any images available right now.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {visibleMedia.length > 1 && (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                {visibleMedia.map((item, index) => (
                  <button
                    key={`${item.url}-${index}`}
                    type="button"
                    onClick={() => setLightbox(index)}
                    aria-label={`View ${item.label.toLowerCase()} ${index + 1}`}
                    aria-current={index === activeIndex}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      index === activeIndex
                        ? "border-[var(--accent)]"
                        : "border-[var(--border)] hover:border-[var(--border-hover)]"
                    }`}
                  >
                    <AdoptableArtwork
                      url={item.url}
                      path={item.path}
                      alt={`${item.label} ${index + 1}`}
                      wrapperClassName="h-full w-full"
                      className="h-full w-full object-cover"
                      fallbackLabel=""
                    />
                  </button>
                ))}
              </div>
            )}

            {comparisons.length > 0 && (
              <div className="adoptable-glass-panel mt-6 p-5">
                <h2 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-dim)]">
                  <GitCompare className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
                  Before &amp; After
                </h2>
                <div className="space-y-6">
                  {comparisons.map((pair, index) => (
                    <ComparisonPair key={pair.id ?? index} pair={pair} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------- RIGHT: details */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={status} size="md" />
              <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                {categoryLabel(adoptable.category)}
              </span>
              {adoptable.featured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                  <Sparkles className="h-3 w-3 fill-current" aria-hidden />
                  Featured
                </span>
              )}
            </div>

            <h1 className="display-lg mt-3 text-white">{adoptable.title}</h1>
            {adoptable.species && (
              <p className="mt-2 text-sm uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                {adoptable.species}
              </p>
            )}

            <PriceList
              adoptable={adoptable}
              ageVerified={ageVerified}
              className="mt-7"
              variant="detail"
            />

            {/* Availability / CTA */}
            <div className="mt-7">
              {purchasable ? (
                <>
                  <button
                    type="button"
                    onClick={() => window.open(DISCORD_URL, "_blank", "noopener,noreferrer")}
                    className="btn-primary inline-flex w-full items-center justify-center gap-2 !py-4 !text-sm"
                  >
                    {status === "pending" ? "Join the Claim" : "Adopt / Claim"}
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </button>
                  {status === "pending" && (
                    <p className="mt-3 text-xs text-[var(--text-secondary)]">
                      Someone is currently claiming this character. Message us anyway and we&rsquo;ll
                      let you know if they fall through.
                    </p>
                  )}
                </>
              ) : (
                <div
                  className={`rounded-xl border px-5 py-5 text-center ${meta.bg} ${meta.border}`}
                >
                  <p className={`text-base font-semibold ${meta.text}`}>
                    {status === "sold"
                      ? "This adoptable has already found a home."
                      : "This adoptable is reserved."}
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {unavailabilityMessage(adoptable.availability)} It stays in the gallery as part
                    of the portfolio.
                  </p>
                </div>
              )}

              {!ageVerified && hasNsfw && (
                <button
                  type="button"
                  onClick={() => setShowAgeGate(true)}
                  className="btn-secondary mt-3 inline-flex w-full items-center justify-center gap-2 !py-2.5 !text-sm"
                >
                  <Lock className="h-4 w-4" aria-hidden />
                  Verify Age for NSFW Content
                </button>
              )}
            </div>

            {features.length > 0 && (
              <InfoBlock title="Included">
                <ul className="space-y-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </InfoBlock>
            )}

            {adoptable.description && <InfoBlock title="Description">{adoptable.description}</InfoBlock>}
            {adoptable.vrchat_info && <InfoBlock title="VRChat Information">{adoptable.vrchat_info}</InfoBlock>}
            {adoptable.rules_license && <InfoBlock title="Rules &amp; License">{adoptable.rules_license}</InfoBlock>}
          </div>
        </div>
      </div>

      {showAgeGate && <AgeVerifier onVerified={() => { setAgeVerified(true); setShowAgeGate(false); }} />}

      {lightbox !== null && active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Artwork ${activeIndex + 1} of ${visibleMedia.length}`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) setLightbox(null);
          }}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close artwork viewer"
            className="absolute -top-2 right-0 grid h-10 w-10 translate-x-2 -translate-y-2 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 md:-top-3 md:right-2"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          {visibleMedia.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => stepLightbox(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 md:left-5"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => stepLightbox(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 md:right-5"
              >
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
            </>
          )}

          <div className="flex max-h-[90vh] max-w-[92vw] flex-col items-center gap-4">
            <AdoptableArtwork
              url={active.url}
              path={active.path}
              alt={adoptable.title || "Adoptable artwork"}
              className="max-h-[78vh] max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl shadow-black/60"
              objectFit="contain"
              fallbackLabel="Artwork could not be loaded"
            />
            <p className="text-sm text-white/60">
              {activeIndex + 1} / {visibleMedia.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}