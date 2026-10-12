"use client";

import Link from "next/link";
import { useState } from "react";
import type { Game } from "@/lib/games";

// Static HUD values: the MVP has no game logic.
const SCORE = 12450;
const LIVES = 3;
const LEVEL = 1;

export function GamePlayer({ game }: { game: Game }) {
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [name, setName] = useState("GUEST");
  const [saved, setSaved] = useState(false);

  const restart = () => {
    setPaused(false);
    setOver(false);
    setSaved(false);
  };

  return (
    <div className="av-player fade-in">
      <div className="player-hud">
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div className="hud-stat">
            <div className="l">Player</div>
            <div className="v" style={{ color: "var(--ink)" }}>
              {name}
            </div>
          </div>
          <div className="hud-stat">
            <div className="l">Score</div>
            <div className="v">{SCORE.toLocaleString("en-US")}</div>
          </div>
          <div className="hud-stat lives">
            <div className="l">Lives</div>
            <div className="v">{"♥ ".repeat(LIVES).trim()}</div>
          </div>
          <div className="hud-stat level">
            <div className="l">Level</div>
            <div className="v">{String(LEVEL).padStart(2, "0")}</div>
          </div>
        </div>
        <div className="hud-actions">
          <button
            type="button"
            className="btn yellow"
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? "RESUME" : "PAUSE"}
          </button>
          <button type="button" className="btn magenta" onClick={() => setOver(true)}>
            END
          </button>
          <Link href={`/games/${game.id}`} className="btn ghost">
            EXIT
          </Link>
        </div>
      </div>

      <div className="crt">
        <div className="crt-screen">
          <div className="game-arena">
            <div className="grid-floor"></div>
            <div className="enemy e1"></div>
            <div className="enemy e2"></div>
            <div className="enemy e3"></div>
            <div className="player-ship"></div>
          </div>
          {paused && (
            <div
              className="crt-content"
              style={{ background: "rgba(0,0,0,0.6)", zIndex: 5 }}
            >
              <div>
                <div className="pixel neon-yellow" style={{ fontSize: 22 }}>
                  PAUSED
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--ink-dim)",
                    marginTop: 10,
                    letterSpacing: "0.16em",
                  }}
                >
                  PRESS RESUME TO CONTINUE
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="crt-bottom">
          <span className="led">SIGNAL OK</span>
          <span>{game.title} · CRT-83 · 60 HZ</span>
          <span>LOAD · 1MB</span>
        </div>
      </div>

      {over && (
        <div className="modal-bd">
          <div className="modal">
            <h2>GAME OVER</h2>
            <div className="final-label">FINAL SCORE</div>
            <div className="final">{SCORE.toLocaleString("en-US")}</div>
            {!saved ? (
              <div className="input-row">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="YOUR INITIALS"
                />
                <button
                  type="button"
                  className="btn yellow"
                  onClick={() => setSaved(true)}
                >
                  SAVE SCORE
                </button>
              </div>
            ) : (
              <div className="toast-saved">▸ SCORE SAVED_</div>
            )}
            <div className="actions">
              <button type="button" className="btn" onClick={restart}>
                PLAY AGAIN
              </button>
              <Link href="/games" className="btn magenta">
                BACK TO THE VAULT
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
