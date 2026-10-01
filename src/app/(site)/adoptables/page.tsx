"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getAdoptables, getAllAdoptableGalleryImages } from "@/lib/db";
import { isAgeVerified } from "@/components/AgeVerifier";
import AgeVerifier from "@/components/AgeVerifier";
import type { Adoptable, AdoptableGalleryImage } from "@/types/database";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { Sparkles, ShoppingCart, Package, CheckCircle, Clock, XCircle, Filter, Eye, Lock, Layers } from "lucide-react";

const STATUS_CONFIG = {
  available: { label: "AVAILABLE", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  reserved: { label: "RESERVED", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  sold: { label: "SOLD", icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
} as const;

function StatusBadge({ status }: { status: "available" | "sold" | "reserved" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="product-card animate-pulse">
      <div className="product-image aspect-[3/4] w-full skeleton" />
      <div className="mt-3 space-y-2 p-3">
        <div className="h-4 w-3/4 rounded bg-[var(--border)]" />
        <div className="h-3 w-1/3 rounded bg-[var(--border)]" />
      </div>
    </div>
  );
}

function AdoptableCard({
  adoptable,
  galleryMap,
  ageVerified,
}: {
  adoptable: Adoptable;
  galleryMap: Record<string, AdoptableGalleryImage[]>;
  ageVerified: boolean;
}) {
  const preview = useMemo(() => {
    if (adoptable.main_image) return adoptable.main_image;
    const imgs = galleryMap[adoptable.id];
    if (imgs && imgs.length > 0) {
      const sfwImg = imgs.find((img) => !img.is_nsfw);
      return sfwImg ? sfwImg.url : imgs[0].url;
    }
    return null;
  }, [adoptable, galleryMap]);

  const hasNsfw = useMemo(() => {
    if (adoptable.nsfw_available) return true;
    const g = galleryMap[adoptable.id];
    return !!g && g.some((img) => img.is_nsfw);
  }, [adoptable, galleryMap]);

  const showNsfw = ageVerified || !hasNsfw;
  const isSold = adoptable.availability === "sold";
  const isReserved = adoptable.availability === "reserved";

  const cfg = STATUS_CONFIG[adoptable.availability] || STATUS_CONFIG.available;

  return (
    <div className="group relative">
      <Link href={`/adoptables/${adoptable.id}`} className="block">
        <div className="product-card">
          <div className="product-image relative aspect-[3/4] overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 group-hover:border-[var(--accent)]/40 group-hover:shadow-[var(--shadow-lg)]">
            {preview ? (
              <img
                src={preview}
                alt={adoptable.title}
                loading="lazy"
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
                  hasNsfw && !showNsfw ? "blur-[6px] grayscale" : ""
                }`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-12 w-12 text-[var(--text-dim)]" />
              </div>
            )}

            <div className="absolute top-3 right-3 z-10">
              <StatusBadge status={adoptable.availability} />
            </div>

            {hasNsfw && !showNsfw && (
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-400">
                  <Lock className="h-3 w-3" />
                  NSFW
                </span>
              </div>
            )}

            {adoptable.featured && (
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                  <Sparkles className="h-3 w-3 fill-current" />
                  Featured
                </span>
              </div>
            )}

            {isSold && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-rose-500/20 backdrop-blur-sm">
                <span className="text-3xl font-black text-rose-400">SOLD</span>
              </div>
            )}

            {isReserved && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-amber-500/20 backdrop-blur-sm">
                <span className="text-3xl font-black text-amber-400">RESERVED</span>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                <Eye className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div className="mt-3 px-1">
            <h3 className="text-base font-semibold text-white group-hover:text-[var(--accent)] transition-colors">
              {adoptable.title || "Unnamed"}
            </h3>
            {adoptable.species && (
              <p className="mt-0.5 text-xs text-[var(--text-secondary)] uppercase tracking-wider">{adoptable.species}</p>
            )}
            {adoptable.description && (
              <p className="mt-1 line-clamp-2 text-xs text-[var(--text-dim)] leading-relaxed">
                {adoptable.description}
              </p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              {adoptable.sfw_available && adoptable.sfw_price && (
                <span className="text-xs text-[var(--text-secondary)]">
                  SFW <strong className="text-white font-semibold">{adoptable.sfw_price}</strong>
                </span>
              )}
              {adoptable.nsfw_available && adoptable.nsfw_price && (
                <span className="text-xs text-[var(--text-secondary)]">
                  NSFW <strong className="text-white font-semibold">{showNsfw ? adoptable.nsfw_price : "Age-restricted"}</strong>
                </span>
              )}
              {adoptable.bundle_available && adoptable.bundle_price && (
                <span className="text-xs text-[var(--text-secondary)]">
                  Bundle <strong className="text-white font-semibold">{showNsfw ? adoptable.bundle_price : "Age-restricted"}</strong>
                </span>
              )}
              {!adoptable.sfw_available && !adoptable.nsfw_available && !adoptable.bundle_available && adoptable.price && (
                <span className="text-xs text-[var(--text-secondary)]">
                  <strong className="text-white font-semibold">{adoptable.price}</strong>
                </span>
              )}
            </div>

            <div className="mt-4">
              {!isSold && !isReserved && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open("https://discord.gg/zt48MZm5kD", "_blank", "noopener,noreferrer");
                  }}
                  className="btn-primary w-full !py-2.5 !px-4 !text-sm inline-flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Adopt Now
                </button>
              )}
              {isReserved && (
                <button
                  disabled
                  className="btn-secondary w-full !py-2.5 !px-4 !text-sm inline-flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                >
                  <Clock className="h-4 w-4" />
                  Reserved
                </button>
              )}
              {isSold && (
                <button
                  disabled
                  className="w-full !py-2.5 !px-4 !text-sm inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 cursor-not-allowed"
                >
                  <XCircle className="h-4 w-4" />
                  Sold Out
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function AdoptablesPage() {
  const [adoptables, setAdoptables] = useState<Adoptable[]>([]);
  const [galleryMap, setGalleryMap] = useState<Record<string, AdoptableGalleryImage[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const setupAttemptedRef = useRef(false);

  useEffect(() => {
    setAgeVerified(isAgeVerified());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function ensureDatabaseReady() {
      if (setupAttemptedRef.current) return;
      setupAttemptedRef.current = true;

      try {
        const checkRes = await fetch("/api/setup/database", { method: "GET" });
        const checkData = await checkRes.json();

        if (checkData.needsSetup) {
          const setupRes = await fetch("/api/setup/database", { method: "POST" });
          const setupData = await setupRes.json();

          if (!setupData.success && setupData.error && setupData.error.includes("SUPABASE_ACCESS_TOKEN")) {
            if (!cancelled) {
              setError("MANUAL_SETUP_REQUIRED");
            }
            return;
          }
        }
      } catch (e) {
        console.error("Database setup check failed:", e);
      }
    }

    async function load() {
      setLoading(true);
      setError(null);

      try {
        await ensureDatabaseReady();

        const [adoptablesData, galleryData] = await Promise.all([
          getAdoptables().catch((err) => {
            console.error("getAdoptables failed:", err);
            if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string" && (err as any).message.includes("ADOPTABLES_TABLE_MISSING")) {
              throw err;
            }
            return [] as Adoptable[];
          }),
          getAllAdoptableGalleryImages().catch((err) => {
            console.error("getAllAdoptableGalleryImages failed:", err);
            if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string" && (err as any).message.includes("ADOPTABLE_GALLERY_TABLE_MISSING")) {
              throw err;
            }
            return [] as AdoptableGalleryImage[];
          }),
        ]);

        if (cancelled) return;

        const gMap: Record<string, AdoptableGalleryImage[]> = {};
        galleryData.forEach((img) => {
          const aid = img.adoptable_id;
          if (aid) {
            if (!gMap[aid]) gMap[aid] = [];
            gMap[aid].push(img);
          }
        });

        setAdoptables(adoptablesData);
        setGalleryMap(gMap);

        if (adoptablesData.length === 0 && galleryData.length === 0) {
          setError("EMPTY");
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error("Failed to load adoptables:", e);
          const msg = e?.message || "Unable to load adoptables.";
          if (msg.includes("ADOPTABLES_TABLE_MISSING")) {
            setError("DATABASE_NOT_SETUP");
          } else {
            setError("ERROR");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filters = useMemo(() => [
    { id: "all", label: "All", icon: Layers },
    { id: "available", label: "Available", icon: CheckCircle },
    { id: "reserved", label: "Reserved", icon: Clock },
    { id: "sold", label: "Sold", icon: XCircle },
    { id: "sfw", label: "SFW", icon: Eye },
    { id: "nsfw", label: "NSFW", icon: Lock },
    { id: "both", label: "SFW+NSFW", icon: Package },
  ], []);

  const filtered = useMemo(() => {
    return adoptables.filter((a) => {
      switch (activeFilter) {
        case "available":
          return a.availability === "available";
        case "reserved":
          return a.availability === "reserved";
        case "sold":
          return a.availability === "sold";
        case "sfw":
          return a.sfw_available && a.availability !== "sold";
        case "nsfw":
          return a.nsfw_available && a.availability !== "sold";
        case "both":
          return a.sfw_available && a.nsfw_available && a.availability !== "sold";
        default:
          return true;
      }
    });
  }, [adoptables, activeFilter]);

  const totalAdoptables = adoptables.length;
  const availableCount = adoptables.filter((a) => a.availability === "available").length;
  const soldCount = adoptables.filter((a) => a.availability === "sold").length;
  const reservedCount = adoptables.filter((a) => a.availability === "reserved").length;

  const handleAgeVerified = () => {
    setAgeVerified(true);
    setShowAgeGate(false);
  };

  function ErrorState({ error }: { error: string }) {
    return (
      <section className="section-sm">
        <div className="container">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Package className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Adoptables database not set up</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
              The adoptables feature needs its Supabase tables created before it can load anything.
            </p>
            <p className="text-sm text-[var(--text-dim)] mb-6">
              Go to your Supabase project &rarr; <span className="font-mono text-[var(--accent)]">SQL Editor</span> &rarr; New query, paste the contents of <span className="font-mono text-[var(--accent)]">supabase/schema.sql</span>, and run it.
            </p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                setupAttemptedRef.current = false;
                const load = async () => {
                  try {
                    const [adoptablesData, galleryData] = await Promise.all([
                      getAdoptables().catch((err) => { console.error("getAdoptables failed:", err); return [] as Adoptable[]; }),
                      getAllAdoptableGalleryImages().catch((err) => { console.error("getAllAdoptableGalleryImages failed:", err); return [] as AdoptableGalleryImage[]; }),
                    ]);
                    const gMap: Record<string, AdoptableGalleryImage[]> = {};
                    galleryData.forEach((img) => {
                      const aid = img.adoptable_id;
                      if (aid) { if (!gMap[aid]) gMap[aid] = []; gMap[aid].push(img); }
                    });
                    setAdoptables(adoptablesData);
                    setGalleryMap(gMap);
                  } catch (e) {
                    console.error("Retry failed:", e);
                    setError("DATABASE_NOT_SETUP");
                  } finally {
                    setLoading(false);
                  }
                };
                load();
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
              Retry after setup
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="relative">
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Adoptables"
            title="Adoptable Characters"
            subtitle="Handcrafted avatar designs available for instant adoption. Browse the gallery, pick a character you love, and message me on Discord to claim it."
          />
        </div>
      </section>

      {loading ? (
        <div className="container section-sm">
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Reveal key={i} delay={(i % 4) * 60}>
                <SkeletonCard />
              </Reveal>
            ))}
          </div>
        </div>
      ) : error === "MANUAL_SETUP_REQUIRED" || error === "DATABASE_NOT_SETUP" ? (
        <ErrorState error={error || "DATABASE_NOT_SETUP"} />
      ) : error === "EMPTY" ? (
        <section className="section-sm">
          <div className="container">
            <div className="mx-auto max-w-md text-center empty-state">
              <div className="empty-state-icon">
                <Package className="h-7 w-7" />
              </div>
              <h3 className="empty-state-title">No adoptables yet</h3>
              <p className="empty-state-desc">
                There are currently no adoptables available. Check back later &mdash; new characters are added regularly.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="container section-sm">
          <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <Package className="h-4 w-4" />
              {totalAdoptables} total
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              {availableCount} available
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <Clock className="h-4 w-4" />
              {reservedCount} reserved
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-400">
              <XCircle className="h-4 w-4" />
              {soldCount} sold
            </span>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {filters.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-semibold transition-all duration-300 ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-white"
                  }`}
                >
                  <f.icon className="h-3.5 w-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center empty-state">
              <div className="empty-state-icon">
                <Filter className="h-6 w-6" />
              </div>
              <h3 className="empty-state-title">No matches</h3>
              <p className="empty-state-desc">No adoptables match the selected filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((adoptable) => (
                <Reveal key={adoptable.id} delay={0}>
                  <AdoptableCard
                    adoptable={adoptable}
                    galleryMap={galleryMap}
                    ageVerified={ageVerified}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      )}

      {!ageVerified &&
        totalAdoptables > 0 &&
        filtered.some(
          (a) =>
            a.nsfw_available || (galleryMap[a.id] || []).some((img) => img.is_nsfw),
        ) && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[45] max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center backdrop-blur-md">
            <p className="mb-2 text-sm text-white">
              Some adoptables contain NSFW content. Verify your age to view
              NSFW prices and images.
            </p>
            <button
              onClick={() => setShowAgeGate(true)}
              className="btn-primary !py-1.5 !px-4 !text-sm inline-flex items-center gap-2"
            >
              <Lock className="h-3 w-3" />
              Verify Age
            </button>
          </div>
        )}

      {showAgeGate && <AgeVerifier onVerified={handleAgeVerified} />}
    </div>
  );
}
