"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createAsteroids } from "@/lib/games/asteroids";
import type { AsteroidsGame, AsteroidsSnapshot } from "@/lib/games/asteroids";

interface AsteroidsCanvasProps {
  /** Filled with the running game so the host can call pause, resume, restart and end. */
  controllerRef: RefObject<AsteroidsGame | null>;
  onStateChange: (snapshot: AsteroidsSnapshot) => void;
  onGameOver: (finalScore: number) => void;
  /** Called each time a fresh game starts, so the host can reset its own UI state. */
  onStart: () => void;
}

export function AsteroidsCanvas({
  controllerRef,
  onStateChange,
  onGameOver,
  onStart,
}: AsteroidsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep the latest callbacks without recreating the game when the host re-renders.
  const handlers = useRef({ onStateChange, onGameOver, onStart });
  useEffect(() => {
    handlers.current = { onStateChange, onGameOver, onStart };
  });

  // One game per mount. Strict Mode and route Activity run the cleanup and then
  // the effect again, so every run must create a fresh game and destroy it on exit.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = createAsteroids(canvas, {
      onStateChange: (snapshot) => handlers.current.onStateChange(snapshot),
      onGameOver: (finalScore) => handlers.current.onGameOver(finalScore),
    });
    controllerRef.current = game;
    handlers.current.onStart();
    game.start();

    return () => {
      game.destroy();
      if (controllerRef.current === game) controllerRef.current = null;
    };
  }, [controllerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="asteroids-canvas"
      aria-label="Asteroids game screen"
      role="img"
    />
  );
}
