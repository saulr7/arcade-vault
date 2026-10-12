import Link from "next/link";
import { Silhouettes } from "@/components/home/silhouettes";

export function Hero() {
  return (
    <section className="home-hero">
      <Silhouettes />
      <div className="home-hero-inner">
        <div className="hero-eyebrow pixel neon-yellow">
          ▸ INSERT A COIN<span className="blink">_</span>
        </div>
        <h1 className="home-title">
          <span className="line-1">THE CLASSIC</span>
          <span className="line-2">ARCADE IS</span>
          <span className="line-3">BACK</span>
        </h1>
        <p className="home-sub">
          Play the best classics right in your browser.
          <br />
          No downloads. No cost. Just fun.
        </p>
        <div className="home-ctas">
          <Link href="/games" className="btn xl pulse">
            ▶ EXPLORE GAMES
          </Link>
          <Link href="/auth" className="btn xl magenta">
            ✦ CREATE ACCOUNT
          </Link>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <span>SCROLL</span>
          <span className="arrow">▼</span>
        </div>
      </div>
    </section>
  );
}
