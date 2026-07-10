import { tosSections } from "@/data/site";
import SectionTitle from "@/components/SectionTitle";

export default function ToSPage() {
  return (
    <div className="relative">
      <section className="page">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <span className="section-label justify-center">Terms</span>
            <h1 className="display-lg text-white mb-4">Terms of Service</h1>
            <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
              By commissioning me, you agree to the rules below. Please read carefully before ordering.
            </p>
          </div>

          <div className="space-y-3">
            {tosSections.map((section) => (
              <div
                key={section.title}
                className="border border-[var(--border)] rounded-xl p-6 hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]/50 transition-all duration-300"
              >
                <h2 className="text-base font-bold text-white mb-4">{section.icon} {section.title}</h2>
                <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="/contact" className="btn-primary inline-flex">
              Have questions?
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
