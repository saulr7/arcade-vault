import Link from "next/link";

export function FinalCta() {
  return (
    <section className="home-final reveal">
      <h2 className="final-title pixel">READY TO PLAY?</h2>
      <Link href="/games" className="btn xl pulse final-cta">
        INSERT COIN →
      </Link>
      <div className="final-tag">Free. No required sign-up. Start in seconds.</div>
    </section>
  );
}
