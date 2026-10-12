import Link from "next/link";
import { SectionHead } from "@/components/home/section-head";
import { FAQ, PRICING_PERKS } from "@/lib/home";

export function Pricing() {
  return (
    <section className="home-section reveal">
      <SectionHead kicker="// 04" color="green" title="PRICING" />
      <div className="pricing-grid">
        <div className="price-card">
          <div className="pc-label pixel">SINGLE PLAN</div>
          <div className="pc-name pixel">VAULT PLAYER</div>
          <div className="pc-amount">
            <span className="pc-amount-n">$0</span>
            <span className="pc-amount-u">/ FOREVER</span>
          </div>
          <div className="pc-tag">NO TRICKS · NO FINE PRINT</div>
          <ul className="pc-list">
            {PRICING_PERKS.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
          <Link href="/auth" className="btn xl pulse" style={{ width: "100%" }}>
            START FREE →
          </Link>
          <div className="pc-foot">We don&apos;t ask for a card. We never will.</div>
          <div className="pc-stamp pixel">
            FREE
            <br />
            PLAY
          </div>
        </div>

        <div className="pricing-faq">
          {FAQ.map((item) => (
            <div key={item.question} className="faq-item">
              <div className="faq-q pixel">{item.question}</div>
              <div className="faq-a">{item.answer}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
