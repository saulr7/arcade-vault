import Link from "next/link";
import { SectionHead } from "@/components/home/section-head";
import { GAMES } from "@/lib/games";

export function GamesRail() {
  return (
    <section className="home-section reveal">
      <SectionHead kicker="// 02" color="cyan" title="GAMES AVAILABLE NOW" />
      <div className="mini-rail">
        {GAMES.slice(0, 6).map((g) => (
          <Link key={g.id} href={`/games/${g.id}`} className="mini-card">
            <div className="mini-cover">
              <div className={`cover-bg ${g.cover}`}></div>
            </div>
            <div className="mini-meta">
              <div className="mini-title">{g.title}</div>
              <div className="mini-cat">{g.cat}</div>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Link href="/games" className="btn lg">
          VIEW ALL GAMES →
        </Link>
      </div>
    </section>
  );
}
