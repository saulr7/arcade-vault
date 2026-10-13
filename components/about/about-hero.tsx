import { HighlightIcon, type HighlightKind } from "./highlight-icon";

const HIGHLIGHTS: { icon: HighlightKind; text: string; color: "magenta" | "cyan" | "green" }[] = [
  { icon: "HEART", text: "MADE WITH ❤️ FOR PLAYERS", color: "magenta" },
  { icon: "BROWSER", text: "HTML GAMES — RUN IN ANY BROWSER", color: "cyan" },
  { icon: "PLANT", text: "A PROJECT THAT KEEPS GROWING", color: "green" },
];

export function AboutHero() {
  return (
    <section className="about-hero">
      <div className="kicker pixel neon-yellow">▸ ABOUT</div>
      <h1 className="about-title">ABOUT ARCADE VAULT</h1>
      <p className="about-mission">
        ARCADE VAULT was born from a love of classic video games. Our mission is to preserve and
        celebrate the arcades that defined a generation, making them available to everyone,
        anywhere, at no cost.
      </p>

      <div className="highlight-row">
        {HIGHLIGHTS.map((h, i) => (
          <div
            key={h.icon}
            className={`highlight ${h.color}`}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <HighlightIcon kind={h.icon} />
            <div className="hl-text pixel">{h.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
