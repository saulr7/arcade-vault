export interface AsteroidsSnapshot {
  score: number;
  lives: number;
  level: number;
  tripleShotLeft: number; // seconds, 0 when inactive
}

export interface AsteroidsOptions {
  onStateChange: (snapshot: AsteroidsSnapshot) => void;
  onGameOver: (finalScore: number) => void;
}

export interface AsteroidsGame {
  start(): void; // registers input, starts the loop, begins a new run
  pause(): void;
  resume(): void;
  restart(): void; // new run, same canvas
  end(): void; // finishes the run now and calls onGameOver
  destroy(): void; // stops the loop, removes every listener
}
