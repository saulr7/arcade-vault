import type { Metadata } from "next";
import { HallOfFame } from "@/components/hall-of-fame";

export const metadata: Metadata = { title: "Hall of Fame · Arcade Vault" };

export default function HallOfFamePage() {
  return <HallOfFame />;
}
