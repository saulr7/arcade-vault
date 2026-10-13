import type { Metadata } from "next";
import { AboutDivider } from "@/components/about/about-divider";
import { AboutHero } from "@/components/about/about-hero";
import { ContactForm } from "@/components/about/contact-form";
import { ContactIntro } from "@/components/about/contact-intro";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = { title: "About · Arcade Vault" };

export default function AboutPage() {
  return (
    <div className="about fade-in">
      <Reveal />
      <AboutHero />
      <AboutDivider />
      <section className="about-contact reveal">
        <div className="contact-grid">
          <ContactIntro />
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
