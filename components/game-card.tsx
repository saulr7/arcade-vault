"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Game } from "@/lib/games";

export function GameCard({ game }: { game: Game }) {
  const tiltRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
  };

  const onLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = "";
  };

  const href = `/games/${game.id}`;
  const btnColor =
    game.color === "magenta" ? "magenta" : game.color === "yellow" ? "yellow" : "";

  return (
    <div
      ref={tiltRef}
      className="card"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Card-wide link; the PLAY button sits above it */}
      <Link
        href={href}
        aria-label={`${game.title} details`}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />
      <div className="cover">
        <div className={"cover-bg " + game.cover}></div>
        <div className="label">{game.cat}</div>
      </div>
      <div className="meta">
        <div className="title">{game.title}</div>
        <div className="desc">{game.short}</div>
        <div className="row">
          <div className="score-badge">
            <span>BEST SCORE</span>
            <b>{game.best.toLocaleString("en-US")}</b>
          </div>
          <Link
            href={href}
            className={("btn " + btnColor).trim()}
            style={{ position: "relative", zIndex: 2 }}
          >
            PLAY
          </Link>
        </div>
      </div>
    </div>
  );
}
