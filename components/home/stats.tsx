import { STATS } from "@/lib/home";

export function Stats() {
  return (
    <section className="home-stats reveal">
      <div className="stats-inner">
        {STATS.map((st, i) => (
          <div key={st.unit} className="stat-block" style={{ transitionDelay: `${i * 90}ms` }}>
            <div className="stat-n neon-yellow">{st.value}</div>
            <div className="stat-u pixel">{st.unit}</div>
            <div className="stat-s">{st.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
