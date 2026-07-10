"use client";

import { useState, useEffect } from "react";
import ShowcaseCard from "@/components/ShowcaseCard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (!isSupabaseConfigured || !supabase) {
          const stored = localStorage.getItem("adminData");
          if (stored) {
            try {
              const data = JSON.parse(stored);
              if (data.galleryImages && data.galleryImages.length > 0) {
                setImages(data.galleryImages);
              }
            } catch (e) {}
          }
          setLoading(false);
          return;
        }
        const { data } = await supabase.from("gallery_images").select("url").order("sort_order", { ascending: true });
        if (data && data.length > 0) setImages(data.map((img) => img.url));
      } catch (e) {
        console.error("Failed to load gallery:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="relative">
      <section className="page relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 page-head">
            <span className="section-label justify-center">Gallery</span>
            <h2 className="display-lg text-white mb-3">All Work</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">Browse avatar commissions and edits.</p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-[var(--text-dim)]">Loading...</div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)]">
                  <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-[var(--accent)] opacity-20 blur-3xl rounded-full" />
                <div className="relative text-6xl">🖼️</div>
              </div>
              <p className="text-[var(--text-dim)] text-lg">Gallery images will appear here after upload.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
