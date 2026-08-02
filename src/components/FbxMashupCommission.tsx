"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { getFbxMashupCommission } from "@/lib/db";
import { Zap, Mail, Send, Check } from "lucide-react";

interface Commission {
  id: string;
  base1_image_url?: string | null;
  base1_name: string;
  base1_description: string;
  base2_image_url?: string | null;
  base2_name: string;
  base2_description: string;
  final_image_url?: string | null;
  final_description: string;
  includes_features?: string[];
  full_setup_cost?: string;
  add_ons?: string[];
  estimated_completion?: string;
  discord_link?: string;
  email_link?: string;
  commission_form_link?: string;
}

function BaseCard({ title, image, description }: { title: string; image?: string | null; description: string }) {
  return (
    <div className="group relative flex flex-col items-center overflow-hidden rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg shadow-black/30 transition-all duration-500">
      <div className="relative mb-4 aspect-[4/3] w-full max-w-xs overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)]">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
        ) : (
          <div className="grid h-full w-full place-items-center text-[var(--text-dim)]">No image</div>
        )}
      </div>
      <h3 className="mb-2 text-center text-base font-bold text-white">{title || "Untitled base"}</h3>
      <p className="text-center text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

export default function FbxMashupCommission({ inline = false, limit = 1 }: { inline?: boolean; limit?: number }) {
  const [items, setItems] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getFbxMashupCommission();
        setItems(data);
      } catch (e) {
        console.error("Failed to load FBX mashup commission:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const display = limit ? items.slice(0, limit) : items;
  if (loading) {
    return (
      <div className="space-y-4">
        {[1].map((i) => (
          <div key={i} className="animate-pulse rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <div className="mb-4 h-5 w-1/3 rounded bg-[var(--bg)]" />
            <div className="h-4 w-full rounded bg-[var(--bg)]" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className={inline ? "" : "section"}>
      <div className="container">
        {!inline && (
          <div className="mb-12 text-center">
            <span className="section-label">Specialty Service</span>
            <h2 className="display-lg text-white">FBX Mashup Commissions</h2>
            <p className="lead mx-auto mt-4 max-w-2xl">
              Combining multiple FBX models into one cohesive, VRChat-ready character —
              blending bodies, outfits, accessories, and props from different sources.
            </p>
          </div>
        )}

        {display.map((fc) => (
          <Reveal key={fc.id} className="space-y-12">
            {/* Bases + result */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
              <BaseCard title={fc.base1_name} image={fc.base1_image_url} description={fc.base1_description} />
              <div className="flex justify-center self-center">
                <span className="text-3xl font-bold text-[var(--accent)]">+</span>
              </div>
              <BaseCard title={fc.base2_name} image={fc.base2_image_url} description={fc.base2_description} />
            </div>

            <div className="flex justify-center">
              <span className="text-2xl font-bold text-white">=</span>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <BaseCard
                title="Final Mashup"
                image={fc.final_image_url}
                description={fc.final_description}
              />
              <div className="flex flex-col justify-center gap-6">
                {fc.full_setup_cost && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                      Full Setup Cost
                    </p>
                    <p className="text-4xl font-bold text-white">{fc.full_setup_cost}</p>
                  </div>
                )}

                {(fc.includes_features || []).length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                      Includes
                    </p>
                    <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                      {(fc.includes_features || []).map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-[var(--accent)]" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(fc.add_ons || []).length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                      Add-ons
                    </p>
                    <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                      {(fc.add_ons || []).map((a) => (
                        <li key={a} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fc.estimated_completion && (
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--accent)]" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                    <span>Estimated completion: {fc.estimated_completion}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-wrap items-center gap-6 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8">
              <p className="text-sm font-semibold text-white">Get in touch</p>
              <div className="flex flex-wrap items-center gap-4">
                {fc.discord_link && (
                  <a
                    href={fc.discord_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ad-btn ad-btn-secondary ad-btn-sm inline-flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Discord
                  </a>
                )}
                {fc.email_link && (
                  <a
                    href={fc.email_link}
                    className="ad-btn ad-btn-secondary ad-btn-sm inline-flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
                {fc.commission_form_link && (
                  <Link href={fc.commission_form_link} className="ad-btn ad-btn-primary ad-btn-sm inline-flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Request a Mashup
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
