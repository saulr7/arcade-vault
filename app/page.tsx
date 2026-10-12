import { Activity } from "@/components/home/activity";
import { Features } from "@/components/home/features";
import { FinalCta } from "@/components/home/final-cta";
import { GamesRail } from "@/components/home/games-rail";
import { Hero } from "@/components/home/hero";
import { Pricing } from "@/components/home/pricing";
import { Stats } from "@/components/home/stats";
import { Reveal } from "@/components/reveal";

export default function Home() {
  return (
    <div className="home fade-in">
      <Reveal />
      <Hero />
      <Features />
      <GamesRail />
      <Stats />
      <Activity />
      <Pricing />
      <FinalCta />
    </div>
  );
}
