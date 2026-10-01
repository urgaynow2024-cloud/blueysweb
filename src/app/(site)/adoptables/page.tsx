"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  EyeOff,
  Filter,
  Lock,
  Package,
  RefreshCw,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import {
  getAdoptables,
  getAllAdoptableGalleryImages,
} from "@/lib/db";
import { isAgeVerified } from "@/components/AgeVerifier";
import AgeVerifier from "@/components/AgeVerifier";
import type { Adoptable, AdoptableGalleryImage, AdoptableStatus } from "@/types/database";
import {
  ADOPTABLE_STATUS_META,
  canPurchase,
  isPubliclyListed,
  normalizeStatus,
  unavailabilityMessage,
} from "@/lib/adoptables/status";
import { adoptablePriceSummary, categoryLabel } from "@/lib/adoptables/catalog";
import { classifyAdoptablesError, type AdoptablesFailure } from "@/lib/adoptables/errors";
import { pickAdoptableArtwork, pickHeroArtwork } from "@/lib/adoptables/images";
import { AdoptableArtwork } from "@/components/adoptables/AdoptableArtwork";
import { StatusBadge } from "@/components/adoptables/StatusBadge";
import { PriceList } from "@/components/adoptables/PriceList";

const DISCORD_URL = "https://discord.gg/zt48MZm5kD";

const STATUS_FILTERS: AdoptableStatus[] = ["available", "pending", "reserved", "sold"];

const STATUS_ICONS: Record<AdoptableStatus, typeof CheckCircle2> = {
  available: CheckCircle2,
  pending: Clock3,
  reserved: Sparkles,
  sold: XCircle,
  hidden: EyeOff,
};

type ArchiveTab = "available" | "sold";
type ExtraFilter = "sfw" | "nsfw" | "featured";

/* ------------------------------------------------------------------ Cards */

function AdoptableCard({
  adoptable,
  gallery,
  ageVerified,
}: {
  adoptable: Adoptable;
  gallery: AdoptableGalleryImage[];
  ageVerified: boolean;
}) {
  const status = normalizeStatus(adoptable.availability);
  const meta = ADOPTABLE_STATUS_META[status];
  const artwork = pickAdoptableArtwork(adoptable, gallery);
  const hasNsfw =
    Boolean(adoptable.nsfw_available) || gallery.some((img) => img.is_nsfw);
  const blurArtwork = hasNsfw && !ageVerified;
  const purchasable = canPurchase(status);

  return (
    <article className="adoptable-card group overflow-hidden">
      <Link
        href={`/adoptables/${adoptable.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--bg)]">
          <AdoptableArtwork
            url={artwork?.url}
            alt={adoptable.title || "Untitled adoptable"}
            wrapperClassName="h-full w-full"
            className={`h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.05] ${
              blurArtwork ? "blur-[8px] scale-105" : ""
            }`}
            fallbackLabel="Artwork coming soon"
          />

          {blurArtwork && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-rose-200 backdrop-blur">
                <Lock className="h-3 w-3" aria-hidden />
                NSFW — verify to view
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            {adoptable.featured ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/45 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] backdrop-blur">
                <Star className="h-3 w-3 fill-current" aria-hidden />
                Featured
              </span>
            ) : (
              <span />
            )}
            <StatusBadge status={status} className="shadow-lg" />
          </div>

          {status === "sold" && (
            <div className="adoptable-sold-overlay">
              <span className="adoptable-sold-text">SOLD</span>
              <span className="adoptable-sold-subtext">Already found a home</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-white transition-colors group-hover:text-[var(--accent)]">
                {adoptable.title || "Untitled"}
              </h3>
              <p className="mt-0.5 truncate text-[11px] uppercase tracking-wider text-[var(--text-dim)]">
                {adoptable.species ? `${adoptable.species} · ` : ""}
                {categoryLabel(adoptable.category)}
              </p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-[var(--text-dim)]">
              {adoptablePriceSummary(adoptable, ageVerified)}
            </span>
          </div>

          {adoptable.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
              {adoptable.description}
            </p>
          )}

          <PriceList
            adoptable={adoptable}
            ageVerified={ageVerified}
            className="mt-3"
            variant="card"
          />

          <div className="mt-4">
            {purchasable ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  window.open(DISCORD_URL, "_blank", "noopener,noreferrer");
                }}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 !py-2.5 !px-4 !text-sm"
              >
                {status === "pending" ? "Join the Claim" : "Adopt Now"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <div
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold ${meta.text} ${meta.bg} ${meta.border}`}
              >
                {status === "sold" ? "Sold Out" : "Reserved"}
                <span className="font-normal text-[var(--text-dim)]">· View details</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)]">
      <div className="skeleton aspect-[3/4] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-8 w-full rounded-xl" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Page */

export default function AdoptablesPage() {
  const [adoptables, setAdoptables] = useState<Adoptable[]>([]);
  const [galleryMap, setGalleryMap] = useState<Record<string, AdoptableGalleryImage[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [archiveTab, setArchiveTab] = useState<ArchiveTab>("available");
  const [statusFilter, setStatusFilter] = useState<AdoptableStatus | "all">("all");
  const [extras, setExtras] = useState<Set<ExtraFilter>>(new Set());
  const [failure, setFailure] = useState<AdoptablesFailure | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAgeVerified(isAgeVerified());
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFailure(null);

    // The real query is the source of truth. This page used to bail out early
    // whenever `/api/setup/database` reported `needsSetup`, and that endpoint
    // only ever checks a `db_setup_completed` row which is written by the
    // owner-only POST handler. A database initialised by running
    // `supabase/schema.sql` in the SQL Editor never gets that row, so a
    // perfectly working database still rendered "Adoptables are not set up yet"
    // and was never queried at all. Probing the actual tables is authoritative
    // in a way that flag is not.
    try {
      const adoptablesData = await getAdoptables();
      // Gallery is supplementary: the listing still renders without it.
      const galleryData = await getAllAdoptableGalleryImages().catch((err) => {
        console.error("Adoptable gallery failed to load:", err);
        return [] as AdoptableGalleryImage[];
      });

      const map: Record<string, AdoptableGalleryImage[]> = {};
      for (const img of galleryData) {
        if (!img.adoptable_id) continue;
        (map[img.adoptable_id] ??= []).push(img);
      }

      setAdoptables(adoptablesData);
      setGalleryMap(map);

      if (adoptablesData.length === 0) setError("EMPTY");
    } catch (e: any) {
      console.error("Failed to load adoptables:", e);
      // Every failure is classified, so a permission or network problem is no
      // longer reported to the owner as "your tables are missing".
      const failure = classifyAdoptablesError(e?.failure ?? e);
      setFailure(failure);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const galleryFor = useCallback((id: string) => galleryMap[id] ?? [], [galleryMap]);

  const listed = useMemo(() => adoptables.filter((a) => isPubliclyListed(a.availability)), [adoptables]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: listed.length };
    for (const status of STATUS_FILTERS) {
      result[status] = listed.filter((a) => normalizeStatus(a.availability) === status).length;
    }
    return result;
  }, [listed]);

  const toggleExtra = (filter: ExtraFilter) => {
    setExtras((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return listed.filter((adoptable) => {
      const status = normalizeStatus(adoptable.availability);

      if (archiveTab === "sold" && status !== "sold") return false;
      if (archiveTab === "available" && status === "sold") return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;

      if (extras.has("sfw") && !adoptable.sfw_available) return false;
      if (extras.has("nsfw") && !adoptable.nsfw_available) return false;
      if (extras.has("featured") && !adoptable.featured) return false;

      return true;
    });
  }, [listed, archiveTab, statusFilter, extras]);

  const hero = useMemo(() => pickHeroArtwork(listed, galleryMap), [listed, galleryMap]);

  const hasNsfwAnywhere = useMemo(
    () =>
      listed.some(
        (a) => a.nsfw_available || galleryFor(a.id).some((img) => img.is_nsfw),
      ),
    [listed, galleryFor],
  );

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAgeVerified = () => {
    setAgeVerified(true);
    setShowAgeGate(false);
  };

  /* --------------------------------------------------------------- States */

  // Each database failure gets its own message. The previous single
  // "not set up yet" branch told the owner to re-run SQL for problems that had
  // nothing to do with schema, and hid the real Postgres error entirely.
  if (failure) {
    const copy: Record<
      AdoptablesFailure["kind"],
      { title: string; body: string; tone: "danger" | "warning" }
    > = {
      table_missing: {
        title: "Adoptables are not set up yet",
        body: "The adoptables tables were not found in the Supabase project this site is connected to. This is the one case where the schema really is absent — check that the SQL was run against the same project as NEXT_PUBLIC_SUPABASE_URL.",
        tone: "warning",
      },
      permission_denied: {
        title: "Database permission error",
        body: "Supabase refused to read the adoptables table. This is a row-level security or grants problem, not a missing schema, so re-running the SQL will not help. The public anon key needs a SELECT policy on \u201cadoptables\u201d.",
        tone: "danger",
      },
      not_configured: {
        title: "Database not configured",
        body: "This deployment is missing NEXT_PUBLIC_SUPABASE_URL or its public anon key, so no database call could be made.",
        tone: "danger",
      },
      network: {
        title: "Could not reach the database",
        body: "The request to Supabase never completed. This is usually temporary — retry in a moment.",
        tone: "danger",
      },
      query: {
        title: "The adoptables query failed",
        body: "Supabase returned an error for this query. The database message is shown below exactly as it was returned.",
        tone: "danger",
      },
    };
    const view = copy[failure.kind];
    return (
      <div className="container section">
        <div className="mx-auto max-w-lg text-center">
          <div
            className={`mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl ${
              view.tone === "danger"
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--accent-soft)] text-[var(--accent)]"
            }`}
          >
            {view.tone === "danger" ? (
              <XCircle className="h-7 w-7" aria-hidden />
            ) : (
              <Package className="h-7 w-7" aria-hidden />
            )}
          </div>
          <h1 className="mb-3 text-2xl font-bold text-white">{view.title}</h1>
          <p className="mb-4 leading-relaxed text-[var(--text-secondary)]">{view.body}</p>

          {/* The real database error, never swallowed. */}
          <pre className="mb-6 overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-left text-xs text-[var(--text-dim)]">
            {failure.code
              ? `${failure.code}: ${failure.message || "(no message returned)"}`
              : failure.detail}
          </pre>

          {failure.kind === "table_missing" && (
            <p className="mb-6 text-sm text-[var(--text-dim)]">
              In your Supabase project open <span className="font-mono text-[var(--accent)]">SQL Editor</span>,
              paste the contents of{" "}
              <span className="font-mono text-[var(--accent)]">supabase/schema.sql</span> and run it
              against the project referenced by{" "}
              <span className="font-mono text-[var(--accent)]">NEXT_PUBLIC_SUPABASE_URL</span>.
            </p>
          )}

          <button
            type="button"
            onClick={() => void load()}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (error === "EMPTY") {
    return (
      <div className="container section">
        <div className="mx-auto max-w-md text-center empty-state">
          <div className="empty-state-icon">
            <Package className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="empty-state-title">No adoptables yet</h1>
          <p className="empty-state-desc">
            No characters are available for adoption right now. New adoptables are added regularly —
            check back soon.
          </p>
          <Link href="/commission" className="btn-primary mt-6 inline-flex items-center gap-2">
            Commission an Avatar
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="section-eyebrow">Commissions / Adoptables</p>
              <h1 className="display-lg mt-3 text-white">
                Characters looking
                <br />
                for their new home.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--text-secondary)]">
                Unique VRChat characters designed and created by Bluey&rsquo;s Creations. Every
                adoptable is VRChat ready and ready for its next owner.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button type="button" onClick={scrollToGallery} className="btn-primary inline-flex items-center gap-2">
                  Browse Adoptables
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
                <Link href="/commission" className="btn-secondary inline-flex items-center gap-2">
                  Commission an Avatar
                </Link>
              </div>

              <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
                {STATUS_FILTERS.filter((s) => counts[s] > 0).map((status) => {
                  const meta = ADOPTABLE_STATUS_META[status];
                  const Icon = STATUS_ICONS[status];
                  return (
                    <div key={status}>
                      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--text-dim)]">
                        <Icon className={`h-3.5 w-3.5 ${meta.text}`} aria-hidden />
                        {meta.label}
                      </dt>
                      <dd className="mt-0.5 text-2xl font-semibold text-white">{counts[status]}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            {/* Real artwork from the database — never a solid colour block. */}
            <div className="adoptable-hero">
              <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5]">
                {hero ? (
                  <>
                    <AdoptableArtwork
                      url={hero.artwork.url}
                      alt={hero.adoptable.title || "Featured adoptable character"}
                      wrapperClassName="h-full w-full"
                      className="h-full w-full object-cover"
                      loading="eager"
                      fallbackLabel="Artwork coming soon"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0e111a] via-[#0e111a]/60 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
                          {hero.adoptable.featured ? "Featured adoptable" : "Latest character"}
                        </p>
                        <p className="mt-1 truncate text-xl font-semibold text-white">
                          {hero.adoptable.title}
                        </p>
                        <p className="truncate text-xs uppercase tracking-wider text-[var(--text-dim)]">
                          {hero.adoptable.species || categoryLabel(hero.adoptable.category)}
                        </p>
                      </div>
                      <Link
                        href={`/adoptables/${hero.adoptable.id}`}
                        className="btn-secondary inline-flex shrink-0 items-center gap-2 !py-2 !text-xs"
                      >
                        View
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="adoptable-artwork-fallback flex h-full w-full flex-col items-center justify-center gap-3 px-8 text-center">
                    <Package className="h-10 w-10 text-[var(--text-dim)]" aria-hidden />
                    <p className="text-sm font-semibold text-white">New characters are on the way</p>
                    <p className="max-w-xs text-xs leading-relaxed text-[var(--text-secondary)]">
                      No adoptable artwork has been published yet. Follow along or commission a
                      character of your own.
                    </p>
                    <Link href="/commission" className="btn-secondary mt-1 !py-2 !text-xs">
                      Commission an Avatar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Gallery */}
      <section ref={galleryRef} className="section-sm scroll-mt-24">
        <div className="container">
          {/* Archive tabs */}
          <div className="adoptable-glass-panel mb-6 flex flex-wrap items-center justify-between gap-4 p-3">
            <div role="tablist" aria-label="Adoptables archive" className="flex items-center gap-1">
              {(["available", "sold"] as ArchiveTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={archiveTab === tab}
                  onClick={() => setArchiveTab(tab)}
                  className="adoptable-archive-tab"
                >
                  {tab === "available" ? "Available" : "Sold archive"}
                  <span className="ml-2 text-[10px] tabular-nums text-[var(--text-dim)]">
                    {tab === "available"
                      ? counts.available + counts.pending + counts.reserved
                      : counts.sold}
                  </span>
                </button>
              ))}
            </div>

            {archiveTab === "sold" && (
              <p className="px-2 text-xs text-[var(--text-dim)]">
                Previous adoptables, kept as a portfolio.
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {archiveTab === "available" && (
              <>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  aria-pressed={statusFilter === "all"}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-semibold transition-all ${
                    statusFilter === "all"
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-white"
                  }`}
                >
                  All
                  <span className="tabular-nums opacity-70">{counts.available + counts.pending + counts.reserved}</span>
                </button>
                {STATUS_FILTERS.filter((s) => s !== "sold").map((status) => {
                  const meta = ADOPTABLE_STATUS_META[status];
                  const Icon = STATUS_ICONS[status];
                  const isActive = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(isActive ? "all" : status)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-semibold transition-all ${
                        isActive
                          ? `${meta.border} ${meta.bg} ${meta.text}`
                          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-white"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {meta.title}
                      <span className="tabular-nums opacity-70">{counts[status]}</span>
                    </button>
                  );
                })}

                <span className="mx-1 hidden h-5 w-px bg-[var(--border)] sm:block" aria-hidden />

                {(
                  [
                    { id: "sfw", label: "SFW" },
                    { id: "nsfw", label: "NSFW" },
                    { id: "featured", label: "Featured" },
                  ] as { id: ExtraFilter; label: string }[]
                ).map((option) => {
                  const isActive = extras.has(option.id);
                  const total = listed.filter((a) =>
                    option.id === "sfw"
                      ? a.sfw_available
                      : option.id === "nsfw"
                        ? a.nsfw_available
                        : a.featured,
                  ).length;
                  if (total === 0) return null;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleExtra(option.id)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-all ${
                        isActive
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--border-hover)] hover:text-white"
                      }`}
                    >
                      {option.label}
                      <span className="tabular-nums opacity-70">{total}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center empty-state">
              <div className="empty-state-icon">
                <Filter className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="empty-state-title">
                {archiveTab === "sold" ? "No sold adoptables yet" : "Nothing here yet"}
              </h2>
              <p className="empty-state-desc">
                {archiveTab === "sold"
                  ? "Once characters find a home they stay here as part of the portfolio."
                  : "No adoptables match the filters you picked. Try widening them."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {(extras.size > 0 || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setExtras(new Set());
                      setStatusFilter("all");
                    }}
                    className="btn-secondary !py-2 !text-sm"
                  >
                    Clear filters
                  </button>
                )}
                <Link href="/commission" className="btn-primary !py-2 !text-sm">
                  Commission an Avatar
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((adoptable) => (
                <AdoptableCard
                  key={adoptable.id}
                  adoptable={adoptable}
                  gallery={galleryFor(adoptable.id)}
                  ageVerified={ageVerified}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Age gate */}
      {!ageVerified && hasNsfwAnywhere && (
        <div className="fixed bottom-6 left-1/2 z-[45] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-rose-500/30 bg-[#120d12]/90 p-4 text-center backdrop-blur-xl">
          <p className="mb-3 text-sm text-white">
            Some adoptables contain NSFW artwork. Verify your age to view their images and prices.
          </p>
          <button
            type="button"
            onClick={() => setShowAgeGate(true)}
            className="btn-primary inline-flex items-center gap-2 !py-2 !text-sm"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Verify Age
          </button>
        </div>
      )}

      {showAgeGate && <AgeVerifier onVerified={handleAgeVerified} />}
    </div>
  );
}
