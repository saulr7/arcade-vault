export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "green" | "yellow";

export interface Game {
  id: string; // slug used in the route
  title: string;
  short: string; // card description
  long: string; // detail page description
  cat: GameCategory;
  cover: string; // CSS class for the CSS-drawn cover
  color: GameColor; // card button accent
  best: number;
  plays: string; // pre-formatted, e.g. "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;
}

export const GAMES: Game[] = [
  {
    id: "block-buster",
    title: "BLOCK BUSTER",
    short: "Bounce the ball and smash neon walls.",
    long: "Pilot a paddle-ship and bounce a plasma core to pulverize walls of chromatic blocks. Every level rearranges the grid into impossible patterns. How far will your streak go?",
    cat: "ARCADE",
    cover: "cover-bricks",
    color: "cyan",
    best: 28450,
    plays: "12.4K",
  },
  {
    id: "drop",
    title: "DROP",
    short: "Fit the pieces before the ceiling crushes you.",
    long: "Geometric pieces fall from the dark. Rotate them, lock them in place and clear lines to survive. The speed ramps up mercilessly every 10 lines.",
    cat: "PUZZLE",
    cover: "cover-tetro",
    color: "magenta",
    best: 184220,
    plays: "31.8K",
  },
  {
    id: "serpentine",
    title: "SERPENTINE",
    short: "Grow longer without biting your own tail.",
    long: "A snake of light roams the grid hunting magenta cores. Every bite makes it longer and faster. One wrong move and it devours itself.",
    cat: "ARCADE",
    cover: "cover-snake",
    color: "green",
    best: 7820,
    plays: "9.1K",
  },
  {
    id: "chomper",
    title: "CHOMPER",
    short: "Gobble the dots and escape the ghosts.",
    long: "A hungry circle patrols a maze collecting glowing dots. Four specters hunt it down, but every so often a power pill appears and turns the tables.",
    cat: "ARCADE",
    cover: "cover-glot",
    color: "yellow",
    best: 96400,
    plays: "27.2K",
  },
  {
    id: "invaders",
    title: "INVADERS",
    short: "Defend the planet from rows of aliens.",
    long: "Waves of hostile pixels descend formation after formation. Slide your cannon sideways and fire with precision before they touch the surface.",
    cat: "SHOOTER",
    cover: "cover-invaders",
    color: "green",
    best: 54190,
    plays: "18.0K",
  },
  {
    id: "rocks",
    title: "ROCKS",
    short: "Pulverize asteroids in zero gravity.",
    long: "Your triangular ship drifts through absolute vacuum. Shoot and rotate to split rocks into ever smaller fragments. Watch out for UFOs on the horizon.",
    cat: "SHOOTER",
    cover: "cover-rocas",
    color: "yellow",
    best: 41200,
    plays: "15.6K",
  },
  {
    id: "froggo",
    title: "FROGGO",
    short: "Cross the pixel highway.",
    long: "Hop between lanes of speeding cars and logs drifting down the river. Reach the lily pads before time runs out.",
    cat: "ARCADE",
    cover: "cover-rana",
    color: "green",
    best: 18900,
    plays: "6.4K",
  },
  {
    id: "pixel-duel",
    title: "PIXEL DUEL",
    short: "Two paddles. One ball. Maximum reflexes.",
    long: "The purest duel: two vertical paddles fight over a glowing ball. Play solo against the CPU or local two-player.",
    cat: "VERSUS",
    cover: "cover-duelo",
    color: "cyan",
    best: 24,
    plays: "4.2K",
  },
];

export const CATEGORIES: ("ALL" | GameCategory)[] = [
  "ALL",
  "ARCADE",
  "PUZZLE",
  "SHOOTER",
  "VERSUS",
];

const PLAYERS = [
  "PX_KAI", "NEONFOX", "Z3R0COOL", "M00NRYU", "VAULT_07", "GLITCHA",
  "ATARI_KID", "CYBER_LU", "MAGENTA88", "SCANLINE", "BIT_LORD", "ARKADYA",
  "DROID_X", "RGB_QUEEN", "PIXEL_DAD", "RETROVIRA", "VECTORX", "JOY_STK",
];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

/** Deterministic leaderboard: same seed always yields the same rows (SSR-safe). */
export function seededScores(seed: number, count = 12): ScoreRow[] {
  let s = seed;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const used = new Set<string>();
  const rows: ScoreRow[] = [];
  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      name = PLAYERS[Math.floor(rand() * PLAYERS.length)];
    } while (used.has(name) && used.size < PLAYERS.length);
    used.add(name);
    const base = Math.floor(50000 + rand() * 250000);
    const score = base - i * Math.floor(2000 + rand() * 4000);
    const day = String(1 + Math.floor(rand() * 28)).padStart(2, "0");
    const mon = String(1 + Math.floor(rand() * 12)).padStart(2, "0");
    rows.push({
      rank: i + 1,
      name,
      score: Math.max(score, 1000),
      date: `${mon}/${day}/2026`, // en-US
    });
  }
  return rows
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
