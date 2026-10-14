"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AsteroidsCanvas } from "@/components/asteroids-canvas";
import type { AsteroidsGame, AsteroidsSnapshot } from "@/lib/games/asteroids";
import type { Game } from "@/lib/games";

// Static HUD values for the games that are still a mock.
const SCORE = 12450;
const LIVES = 3;
const LEVEL = 1;

const ASTEROIDS_START: AsteroidsSnapshot = {
  score: 0,
  lives: 3,
  level: 1,
  tripleShotLeft: 0,
};

export function GamePlayer({ game }: { game: Game }) {
  const isAsteroids = game.id === "rocks";
  const asteroidsRef = useRef<AsteroidsGame | null>(null);
  const [stats, setStats] = useState<AsteroidsSnapshot>(ASTEROIDS_START);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [name, setName] = useState("GUEST");
  const [saved, setSaved] = useState(false);

  const score = isAsteroids ? stats.score : SCORE;
  const lives = isAsteroids ? stats.lives : LIVES;
  const level = isAsteroids ? stats.level : LEVEL;

  const togglePause = useCallback(() => {
    if (over) return;
    if (isAsteroids) {
      if (paused) asteroidsRef.current?.resume();
      else asteroidsRef.current?.pause();
    }
    setPaused(!paused);
  }, [over, isAsteroids, paused]);

  // P key toggles pause. The window losing focus or the tab being hidden pauses
  // the game; coming back never resumes it on its own.
  useEffect(() => {
    if (!isAsteroids) return;

    const pauseOnLeave = () => {
      if (over || paused) return;
      asteroidsRef.current?.pause();
      setPaused(true);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "KeyP" || e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      togglePause();
    };
    const onVisibility = () => {
      if (document.hidden) pauseOnLeave();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", pauseOnLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", pauseOnLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAsteroids, over, paused, togglePause]);

  // A fresh game (first mount, Strict Mode rerun or coming back to the route)
  // always starts unpaused with a clean HUD and no modal.
  const onAsteroidsStart = useCallback(() => {
    setStats(ASTEROIDS_START);
    setPaused(false);
    setOver(false);
    setSaved(false);
  }, []);

  const endRun = () => {
    if (isAsteroids) asteroidsRef.current?.end();
    else setOver(true);
  };

  const restart = () => {
    setPaused(false);
    setOver(false);
    setSaved(false);
    if (isAsteroids) {
      setStats(ASTEROIDS_START);
      asteroidsRef.current?.restart();
    }
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
            <div className="v">{score.toLocaleString("en-US")}</div>
          </div>
          <div className="hud-stat lives">
            <div className="l">Lives</div>
            <div className="v">{"♥ ".repeat(lives).trim()}</div>
          </div>
          <div className="hud-stat level">
            <div className="l">Level</div>
            <div className="v">{String(level).padStart(2, "0")}</div>
          </div>
        </div>
        <div className="hud-actions">
          <button
            type="button"
            className="btn yellow"
            onClick={(e) => {
              togglePause();
              // Keep focus off the button so Space never re-triggers it.
              e.currentTarget.blur();
            }}
          >
            {paused ? "RESUME" : "PAUSE"}
          </button>
          <button
            type="button"
            className="btn magenta"
            onClick={(e) => {
              endRun();
              e.currentTarget.blur();
            }}
          >
            END
          </button>
          <Link href={`/games/${game.id}`} className="btn ghost">
            EXIT
          </Link>
        </div>
      </div>

      <div className="crt">
        <div className="crt-screen">
          {isAsteroids ? (
            <AsteroidsCanvas
              controllerRef={asteroidsRef}
              onStart={onAsteroidsStart}
              onStateChange={setStats}
              onGameOver={() => {
                setPaused(false);
                setOver(true);
              }}
            />
          ) : (
            <div className="game-arena">
              <div className="grid-floor"></div>
              <div className="enemy e1"></div>
              <div className="enemy e2"></div>
              <div className="enemy e3"></div>
              <div className="player-ship"></div>
            </div>
          )}
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
            <div className="final">{score.toLocaleString("en-US")}</div>
            {!saved ? (
              <div className="input-row">
                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value.toUpperCase().slice(0, 10))
                  }
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
