import { GAMES } from "@/lib/games";

export type NeonColor = "cyan" | "magenta" | "green" | "yellow";

export interface Feature {
  icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";
  title: string;
  description: string;
  color: NeonColor;
}

export interface LiveScore {
  player: string;
  gameId: string; // key into GAMES; the title is resolved from it
  score: number;
  ago: string;
  color: NeonColor;
}

export interface TopPlayer {
  rank: number;
  player: string;
  score: number;
}

export interface Stat {
  value: string;
  unit: string;
  sub: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const FEATURES: Feature[] = [
  {
    icon: "GAMEPAD",
    title: "CLASSIC GAMES",
    description:
      "Block breakers, falling blocks, snakes and more. The best arcades of all time in one place.",
    color: "cyan",
  },
  {
    icon: "FREE",
    title: "100% FREE",
    description:
      "No subscriptions, no hidden payments. Every game is available for free.",
    color: "yellow",
  },
  {
    icon: "TROPHY",
    title: "LADDER BOARDS",
    description:
      "Compete with players from all over the world. Climb the ranking and prove who is the best.",
    color: "magenta",
  },
  {
    icon: "ROCKET",
    title: "ALWAYS GROWING",
    description:
      "We keep adding new games. Come back often, there will always be something new to play.",
    color: "green",
  },
];

export const LIVE_SCORES: LiveScore[] = [
  { player: "NEONFOX", gameId: "drop", score: 184220, ago: "2 min ago", color: "magenta" },
  { player: "PX_KAI", gameId: "chomper", score: 96400, ago: "5 min ago", color: "yellow" },
  { player: "Z3R0COOL", gameId: "invaders", score: 54190, ago: "8 min ago", color: "green" },
  { player: "VAULT_07", gameId: "rocks", score: 41200, ago: "12 min ago", color: "cyan" },
  { player: "GLITCHA", gameId: "block-buster", score: 28450, ago: "18 min ago", color: "cyan" },
  { player: "ARKADYA", gameId: "serpentine", score: 7820, ago: "24 min ago", color: "green" },
  { player: "CYBER_LU", gameId: "froggo", score: 18900, ago: "31 min ago", color: "yellow" },
];

export const TOP_PLAYERS: TopPlayer[] = [
  { rank: 1, player: "NEONFOX", score: 312840 },
  { rank: 2, player: "PX_KAI", score: 248110 },
  { rank: 3, player: "M00NRYU", score: 196720 },
  { rank: 4, player: "VAULT_07", score: 154300 },
  { rank: 5, player: "GLITCHA", score: 138900 },
];

export const STATS: Stat[] = [
  { value: String(GAMES.length), unit: "GAMES", sub: "AND COUNTING" },
  { value: "THOUSANDS", unit: "OF GAMES PLAYED", sub: "EVERY DAY" },
  { value: "GLOBAL", unit: "RANKING", sub: "COMPETE WITH THE WORLD" },
];

// Each perk starts with "✔ " because the pricing CSS colors the first letter.
export const PRICING_PERKS: string[] = [
  "✔ Access to every game",
  "✔ Global ranking and hall of fame",
  "✔ No ads between games",
  "✔ Save your scores",
  "✔ New games every month",
  "✔ Works in any browser",
];

export const FAQ: FaqItem[] = [
  {
    question: "IS IT REALLY FREE?",
    answer:
      'Yes. Arcade Vault is a non-profit project made out of love for the classics. There is no hidden "premium" version.',
  },
  {
    question: "DO I NEED AN ACCOUNT?",
    answer:
      "No. You can play as a guest. If you want to save your score and appear in the ranking, sign up in 10 seconds.",
  },
  {
    question: "HOW DO YOU SURVIVE WITHOUT CHARGING?",
    answer:
      "It is a community project. If you like it, share it. That is the only currency we accept.",
  },
];
