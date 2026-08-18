"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingCart,
  Package,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Layers,
  Image as ImageIcon,
  Lock,
} from "lucide-react";

import { getAdoptables, getAllAdoptableGalleryImages } from "@/lib/db";
import { isAgeVerified } from "@/components/AgeVerifier";
import AgeVerifier from "@/components/AgeVerifier";
import type { Adoptable, AdoptableGalleryImage } from "@/types/adoptables";
import Reveal from "@/components/ui/Reveal";

const STATUS_CONFIG = {
  available: { label: "Available", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  reserved: { label: "Reserved", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  sold: { label: "Sold", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
} as const;

function StatusBadge({ status }: { status: "available" | "sold" | "reserved" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.color} ${cfg.bg} ${cfg.border}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="h-[260px] w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--bg)] via-[var(--border)] to-[var(--bg)] bg-[length:200%_100%]" />
      <div className="p-4">
        <div className="mb-2 h-5 w-3/4 rounded bg-[var(--border)] animate-[shimmer_1.5s_infinite]" />
        <div className="mb-2 h-3 w-1/2 rounded bg-[var(--border)] animate-[shimmer_1.5s_infinite]" />
        <div className="h-3 w-full rounded bg-[var(--border)] animate-[shimmer_1.5s_infinite]" />
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

  return (
    <div className="group relative">
      <Link href={`/adoptables/${adoptable.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] transition-all duration-500 group-hover:border-[var(--border-hover)] group-hover:shadow-2xl group-hover:shadow-black/40">
          {preview ? (
            <img
              src={preview}
              alt={adoptable.title}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${
                hasNsfw && !showNsfw ? "blur-[6px] grayscale" : ""
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-[var(--text-dim)]" />
            </div>
          )}

          <div className="absolute top-3 right-3 z-10">
            <StatusBadge status={adoptable.availability} />
          </div>

          {hasNsfw && !showNsfw && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-red-400">
                <Lock className="h-3 w-3" />
                NSFW
              </span>
            </div>
          )}

          {adoptable.featured && (
            <div className="absolute top-14 right-3 z-10">
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-cosmic)]/40 bg-[var(--accent-cosmic)]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--accent-nebula)]">
                <Sparkles className="h-3 w-3 fill-current" />
                Featured
              </span>
            </div>
          )}

          {isSold && (
            <div className="adoptable-card-sold-overlay">
              <span className="adoptable-card-sold-text">SOLD</span>
            </div>
          )}

          {isReserved && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-amber-500/20 backdrop-blur-[2px]">
              <span className="text-4xl font-black text-amber-400">RESERVED</span>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur">
              <Eye className="h-5 w-5" />
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-4">
        <h3 className="text-lg font-bold text-white group-hover:text-[var(--accent)] transition-colors">
          {adoptable.title || "Unnamed"}
        </h3>
        {adoptable.species && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{adoptable.species}</p>
        )}
        {adoptable.description && (
          <p className="mt-1.5 text-xs text-[var(--text-secondary)] line-clamp-2">
            {adoptable.description}
          </p>
        )}

        <div className="mt-3 space-y-1">
          {adoptable.sfw_available && adoptable.sfw_price && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">SFW</span>
              <span className="text-sm font-bold text-white">{adoptable.sfw_price}</span>
            </div>
          )}
          {adoptable.nsfw_available && adoptable.nsfw_price && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                <Lock className="h-3 w-3" /> NSFW
              </span>
              <span className="text-sm font-bold text-white">
                {showNsfw ? adoptable.nsfw_price : "Age-restricted"}
              </span>
            </div>
          )}
          {adoptable.bundle_available && adoptable.bundle_price && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">SFW + NSFW</span>
              <span className="text-sm font-bold text-white">
                {showNsfw ? adoptable.bundle_price : "Age-restricted"}
              </span>
            </div>
          )}
          {!adoptable.sfw_available && !adoptable.nsfw_available && !adoptable.bundle_available && adoptable.price && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">Price</span>
              <span className="text-sm font-bold text-white">{adoptable.price}</span>
            </div>
          )}
        </div>

        <div className="mt-3">
          {!isSold && !isReserved && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open("https://discord.gg/zt48MZm5kD", "_blank", "noopener,noreferrer");
              }}
              className="btn-primary w-full !py-2 !px-4 !text-sm inline-flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Adopt Now
            </button>
          )}
          {isReserved && (
            <button
              disabled
              className="btn-secondary w-full !py-2 !px-4 !text-sm inline-flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
            >
              <Clock className="h-4 w-4" />
              Reserved
            </button>
          )}
          {isSold && (
            <button
              disabled
              className="w-full !py-2 !px-4 !text-sm inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 cursor-not-allowed"
            >
              <XCircle className="h-4 w-4" />
              Sold Out
            </button>
          )}
        </div>
      </div>
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const setupAttemptedRef = useRef(false);

  useEffect(() => {
    setAgeVerified(isAgeVerified());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const setupAttempted = setupAttemptedRef.current;

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
            if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string" && (err as any).message.includes("TABLE_MISSING")) {
              throw err;
            }
            return [] as Adoptable[];
          }),
          getAllAdoptableGalleryImages().catch((err) => {
            console.error("getAllAdoptableGalleryImages failed:", err);
            if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string" && (err as any).message.includes("TABLE_MISSING")) {
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
          if (msg.includes("TABLE_MISSING")) {
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

  const filters = [
    { id: "all", label: "All", icon: Layers },
    { id: "available", label: "Available", icon: CheckCircle },
    { id: "reserved", label: "Reserved", icon: Clock },
    { id: "sold", label: "Sold", icon: XCircle },
    { id: "sfw", label: "SFW", icon: Eye },
    { id: "nsfw", label: "NSFW", icon: Lock },
    { id: "both", label: "SFW+NSFW", icon: Package },
  ];

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

  return (
    <div className="relative">
      <div className="bg-nebula" />
      <div className="bg-cosmic-fog" />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent-cosmic)] opacity-[0.12] blur-[130px] orb-slow" />
        <div className="pointer-events-none absolute top-20 left-1/4 h-60 w-[500px] -translate-x-1/2 rounded-full bg-[var(--accent-nebula)] opacity-[0.08] blur-[120px] orb-med" />
        <div className="pointer-events-none absolute bottom-10 right-1/4 h-48 w-[400px] rounded-full bg-[var(--accent-star)] opacity-[0.06] blur-[100px] orb-fast" />
        <div className="pointer-events-none absolute top-1/2 left-[80%] h-40 w-[350px] rounded-full bg-[var(--accent-3)] opacity-[0.03] blur-[100px] orb-slow" />

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              Adoptables
            </span>
            <h1 className="display-xl mt-5 text-white">
              Adoptable <span className="text-gradient-strong">Characters</span>
            </h1>
            <p className="lead mx-auto mt-4">
              Handcrafted avatar designs available for instant adoption.
              Browse the gallery, pick a character you love, and message me on Discord to claim it.
              Each adoptable is a premade, one-of-a-kind design — not a custom commission.
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="container section-sm">
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Reveal key={i} delay={(i % 4) * 60}>
                <SkeletonCard />
              </Reveal>
            ))}
          </div>
        </div>
      ) : error === "MANUAL_SETUP_REQUIRED" ? (
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
                Go to your Supabase project → <span className="font-mono text-[var(--accent)]">SQL Editor</span> → New query, paste the contents of <span className="font-mono text-[var(--accent)]">supabase/schema.sql</span>, and run it.
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
      ) : error === "DATABASE_NOT_SETUP" ? (
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
                Go to your Supabase project → <span className="font-mono text-[var(--accent)]">SQL Editor</span> → New query, paste the contents of <span className="font-mono text-[var(--accent)]">supabase/schema.sql</span>, and run it.
              </p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
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
      ) : error === "EMPTY" ? (
        <section className="section-sm">
          <div className="container">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Package className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">No adoptables yet</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                There are currently no adoptables available. Check back later — new characters
                are added regularly.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="container section-sm">
          <div className="mb-10 flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
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
            <span className="inline-flex items-center gap-1.5 text-red-400">
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
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Filter className="h-5 w-5" />
              </div>
              <p className="text-[var(--text-secondary)]">
                No adoptables match the selected filter.
              </p>
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
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[45] max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center backdrop-blur-md">
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
