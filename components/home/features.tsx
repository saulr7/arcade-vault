import { FeatureIcon } from "@/components/home/feature-icon";
import { SectionHead } from "@/components/home/section-head";
import { FEATURES } from "@/lib/home";

export function Features() {
  return (
    <section className="home-section reveal">
      <SectionHead kicker="// 01" color="magenta" title="WHY ARCADE VAULT?" />
      <div className="feature-grid">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`feature-card ${f.color}`}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <FeatureIcon kind={f.icon} />
            <div className="ft-title pixel">{f.title}</div>
            <div className="ft-desc">{f.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
