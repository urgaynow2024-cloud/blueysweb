"use client";

interface Props {
  item: {
    id: string;
    name: string;
    description: string;
    tags: string[];
    platforms: string[];
    blenderWork: boolean;
    unityWork: boolean;
    primaryRender: string;
    image_url?: string | null;
    gallery_images?: string[];
    features?: string[];
    optimization?: string;
    beforeAfter?: boolean;
  };
  index: number;
}

export default function ShowcaseCard({ item, index }: Props) {
  const images = item.image_url ? [item.image_url, ...(item.gallery_images || [])] : (item.gallery_images || []);
  const mainImage = images[0];

  return (
    <div
      className="group project-card reveal"
      style={{
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <div className="project-image aspect-[16/10] relative bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg)] overflow-hidden">
        {mainImage ? (
          <img src={mainImage} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8rem] md:text-[9rem] opacity-[0.08] group-hover:opacity-[0.15] group-hover:scale-105 transition-all duration-700 select-none">
              {item.primaryRender}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute top-4 left-4 flex gap-2">
          {item.platforms.map((p) => (
            <span key={p} className="badge badge-pc">
              {p}
            </span>
          ))}
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          {item.blenderWork && (
            <span className="badge badge-blender">Blender</span>
          )}
          {item.unityWork && (
            <span className="badge badge-unity">Unity</span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg-card)] to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-500" />
      </div>

      {/* Gallery strip - little boxes */}
      {images.length > 1 && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.slice(1).map((url, i) => (
              <div key={i} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-[var(--border)]">
                <img src={url} alt={`${item.name} ${i + 2}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-white group-hover:text-[var(--accent)] transition-colors duration-300">
            {item.name}
          </h3>
          {item.beforeAfter && (
            <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider whitespace-nowrap mt-1">
              Before / After
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
          {item.description}
        </p>
        {item.features && item.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.features.slice(0, 4).map((f) => (
              <span
                key={f}
                className="px-2 py-1 rounded-md text-[10px] font-medium bg-[var(--bg)] text-[var(--text-dim)] border border-[var(--border)]"
              >
                {f}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium text-[var(--text-dim)] bg-[var(--bg-elevated)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-[11px] font-semibold text-[var(--accent)] group-hover:translate-x-1 inline-flex items-center gap-1 transition-transform">
            View
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
