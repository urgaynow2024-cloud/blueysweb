import { tosSections } from "@/data/site";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export default function ToSPage() {
  return (
    <div className="relative">
      <section className="page">
        <div className="container max-w-4xl">
          <SectionHeading
            align="center"
            eyebrow="Terms"
            title="Terms of Service"
            subtitle="By commissioning me, you agree to the rules below. Please read carefully before ordering."
          />

          <div className="space-y-3">
            {tosSections.map((section, i) => (
              <Reveal key={section.title} delay={(i % 4) * 50}>
                <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-500 hover:border-[var(--border-hover)]">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                    <span className="text-lg">{section.icon}</span>
                    {section.title}
                  </h2>
                  <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                    {section.items.map((item: string) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <ButtonLink href="/contact">Have questions?</ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
