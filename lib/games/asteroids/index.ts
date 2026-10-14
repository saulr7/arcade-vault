import {
  ASTEROID_HIT_FACTOR,
  H,
  MAX_DT,
  POINTS,
  POWERUP_DROP_CHANCE,
  POWERUP_DURATION,
  POWERUP_GUARANTEED_KILLS,
  RESPAWN_DELAY,
  SAFE_DIST,
  START_ASTEROIDS,
  START_LIVES,
  W,
} from "./constants";
import { Asteroid, Bullet, Particle, PowerUp, Ship } from "./entities";
import { Input } from "./input";
import { dist, rand } from "./math";
import type { AsteroidsGame, AsteroidsOptions, AsteroidsSnapshot } from "./types";

export type { AsteroidsGame, AsteroidsOptions, AsteroidsSnapshot } from "./types";

type RunState = "playing" | "dead" | "gameover";

/** Minimum time between snapshots while the triple-shot countdown is running. */
const COUNTDOWN_EMIT_INTERVAL = 0.1;

export function createAsteroids(
  canvas: HTMLCanvasElement,
  options: AsteroidsOptions,
): AsteroidsGame {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available");
  canvas.width = W;
  canvas.height = H;

  const input = new Input();

  let ship = new Ship();
  let bullets: Bullet[] = [];
  let asteroids: Asteroid[] = [];
  let particles: Particle[] = [];
  let powerUps: PowerUp[] = [];
  let powerUpSpawned = false;
  let killsSinceSpawn = 0;
  let score = 0;
  let lives = START_LIVES;
  let level = 1;
  let state: RunState = "playing";
  let deadTimer = 0;

  let started = false;
  let paused = false;
  let destroyed = false;
  let gameOverFired = false;
  let rafId: number | null = null;
  let lastTime: number | null = null;

  let lastEmitted: AsteroidsSnapshot | null = null;
  let emitTimer = 0;

  // ── State helpers ──────────────────────────────────────────────────────────
  function spawnAsteroids(count: number) {
    for (let i = 0; i < count; i++) {
      let x: number;
      let y: number;
      do {
        x = rand(0, W);
        y = rand(0, H);
      } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
      asteroids.push(new Asteroid(x, y, 3));
    }
  }

  function initGame() {
    ship = new Ship();
    bullets = [];
    asteroids = [];
    particles = [];
    powerUps = [];
    powerUpSpawned = false;
    killsSinceSpawn = 0;
    score = 0;
    lives = START_LIVES;
    level = 1;
    state = "playing";
    deadTimer = 0;
    gameOverFired = false;
    lastEmitted = null;
    emitTimer = 0;
    spawnAsteroids(START_ASTEROIDS);
  }

  function nextLevel() {
    level++;
    bullets = [];
    particles = [];
    powerUps = [];
    powerUpSpawned = false;
    killsSinceSpawn = 0;
    ship.reset();
    spawnAsteroids(3 + level);
  }

  function explode(x: number, y: number, count = 8) {
    for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
  }

  function killShip() {
    explode(ship.x, ship.y, 14);
    ship.dead = true;
    lives--;
    if (lives <= 0) {
      finish();
    } else {
      state = "dead";
      deadTimer = RESPAWN_DELAY;
    }
  }

  // ── Host notifications ─────────────────────────────────────────────────────
  function snapshot(): AsteroidsSnapshot {
    return {
      score,
      lives,
      level,
      tripleShotLeft: Math.max(0, Math.round(ship.tripleShot * 10) / 10),
    };
  }

  /** Emits when score, lives or level change, and every ~100 ms during the triple-shot countdown. */
  function emitIfNeeded(force = false) {
    if (destroyed) return;
    const snap = snapshot();
    const prev = lastEmitted;
    const changed =
      !prev ||
      prev.score !== snap.score ||
      prev.lives !== snap.lives ||
      prev.level !== snap.level;
    const countdownEnded = prev !== null && prev.tripleShotLeft > 0 && snap.tripleShotLeft === 0;
    const countdownTick = snap.tripleShotLeft > 0 && emitTimer >= COUNTDOWN_EMIT_INTERVAL;
    if (force || changed || countdownEnded || countdownTick) {
      lastEmitted = snap;
      emitTimer = 0;
      options.onStateChange(snap);
    }
  }

  /** Ends the run: stops the loop, draws the last frame and fires onGameOver once. */
  function finish() {
    if (gameOverFired) return;
    gameOverFired = true;
    state = "gameover";
    cancelLoop();
    draw(performance.now());
    emitIfNeeded(true);
    options.onGameOver(score);
  }

  // ── Update ─────────────────────────────────────────────────────────────────
  function update(dt: number) {
    if (state === "gameover") return;

    if (state === "dead") {
      deadTimer -= dt;
      particles.forEach((p) => p.update(dt));
      particles = particles.filter((p) => !p.dead);
      asteroids.forEach((a) => a.update(dt));
      if (deadTimer <= 0) {
        state = "playing";
        ship.reset();
      }
      return;
    }

    if (input.consumePress("Space")) {
      bullets.push(...ship.tryShoot());
    }

    ship.update(dt, input);
    bullets.forEach((b) => b.update(dt));
    asteroids.forEach((a) => a.update(dt));
    particles.forEach((p) => p.update(dt));
    powerUps.forEach((p) => p.update(dt));

    bullets = bullets.filter((b) => !b.dead);
    particles = particles.filter((p) => !p.dead);
    powerUps = powerUps.filter((p) => !p.dead);

    for (const p of powerUps) {
      if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
        p.dead = true;
        ship.tripleShot = POWERUP_DURATION;
      }
    }

    // Bullet vs asteroid
    const newAsteroids: Asteroid[] = [];
    for (const b of bullets) {
      for (const a of asteroids) {
        if (!a.dead && !b.dead && dist(b, a) < a.radius) {
          b.dead = true;
          a.dead = true;
          score += POINTS[a.size];
          explode(a.x, a.y, a.size * 5);
          newAsteroids.push(...a.split());
          if (!powerUpSpawned) {
            killsSinceSpawn++;
            const guaranteed = killsSinceSpawn >= POWERUP_GUARANTEED_KILLS;
            if (guaranteed || Math.random() < POWERUP_DROP_CHANCE) {
              powerUps.push(new PowerUp(a.x, a.y));
              powerUpSpawned = true;
            }
          }
        }
      }
    }
    asteroids = asteroids.filter((a) => !a.dead).concat(newAsteroids);
    bullets = bullets.filter((b) => !b.dead);

    // Ship vs asteroid
    if (ship.invincible <= 0) {
      for (const a of asteroids) {
        if (dist(ship, a) < ship.radius + a.radius * ASTEROID_HIT_FACTOR) {
          killShip();
          break;
        }
      }
    }

    // Level cleared
    if (state === "playing" && asteroids.length === 0) nextLevel();
  }

  // ── Draw (world and ship only; the HUD lives in React) ─────────────────────
  function draw(now: number) {
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    particles.forEach((p) => p.draw(ctx));
    asteroids.forEach((a) => a.draw(ctx));
    powerUps.forEach((p) => p.draw(ctx, now));
    bullets.forEach((b) => b.draw(ctx));
    ship.draw(ctx);
  }

  // ── Loop ───────────────────────────────────────────────────────────────────
  function frame(ts: number) {
    rafId = null;
    if (destroyed || paused || state === "gameover") return;
    const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
    lastTime = ts;
    emitTimer += dt;
    update(dt);
    if (destroyed || gameOverFired) return;
    draw(ts);
    emitIfNeeded();
    rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (rafId !== null || destroyed) return;
    lastTime = null;
    rafId = requestAnimationFrame(frame);
  }

  function cancelLoop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    lastTime = null;
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  function newRun() {
    cancelLoop();
    input.reset();
    paused = false;
    initGame();
    draw(performance.now());
    emitIfNeeded(true);
    startLoop();
  }

  return {
    start() {
      if (destroyed || started) return;
      started = true;
      input.attach();
      newRun();
    },

    pause() {
      if (destroyed || !started || paused || state === "gameover") return;
      paused = true;
      cancelLoop();
      // Key-up events can be missed while the page is unfocused.
      input.reset();
    },

    resume() {
      if (destroyed || !started || !paused || state === "gameover") return;
      paused = false;
      startLoop();
    },

    restart() {
      if (destroyed || !started) return;
      newRun();
    },

    end() {
      if (destroyed || !started) return;
      finish();
    },

    destroy() {
      destroyed = true;
      cancelLoop();
      input.detach();
    },
  };
}
