import Link from "next/link";
import { SectionHead } from "@/components/home/section-head";
import { getGame } from "@/lib/games";
import { LIVE_SCORES, TOP_PLAYERS } from "@/lib/home";

const fmt = (n: number) => n.toLocaleString("en-US");

export function Activity() {
  return (
    <section className="home-section reveal">
      <SectionHead kicker="// 03" color="yellow" title="LIVE ACTIVITY" />
      <div className="activity-grid">
        <div className="activity-card">
          <div className="ac-head">
            <div className="ac-title pixel">▸ LATEST SCORES</div>
          </div>
          <div className="ticker">
            {LIVE_SCORES.map((r, i) => (
              <div key={r.player} className="tick-row" style={{ animationDelay: `${i * 60}ms` }}>
                <span className={`tk-p neon-${r.color}`}>{r.player}</span>
                <span className="tk-mid">▸ {getGame(r.gameId)?.title ?? r.gameId}</span>
                <span className="tk-s">+{fmt(r.score)}</span>
                <span className="tk-t">{r.ago}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="activity-card">
          <div className="ac-head">
            <div className="ac-title pixel neon-magenta">▸ TOP PLAYERS · TODAY</div>
            <Link href="/hall-of-fame" className="lb-link">
              VIEW HALL →
            </Link>
          </div>
          <div className="top-list">
            {TOP_PLAYERS.map((r, i) => (
              <div
                key={r.player}
                className={"top-row" + (i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "")}
              >
                <span className="tp-rk">#{String(r.rank).padStart(2, "0")}</span>
                <span className="tp-bar">
                  <span className="tp-fill" style={{ width: `${100 - i * 16}%` }}></span>
                </span>
                <span className="tp-p">{r.player}</span>
                <span className="tp-s">{fmt(r.score)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
