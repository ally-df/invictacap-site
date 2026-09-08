import { strategy } from "@/content/site";
import { Dots } from "../Dots";
import { Section } from "../Section";

export function Strategy() {
  return (
    <Section id="strategy" number={strategy.number} label={strategy.label} anchor="strategy" headline={strategy.voxelHeadline}>
      <div className="relative flex flex-col" style={{ gap: "calc(var(--unit) * 3)", padding: "calc(var(--unit) * 2)" }}>
        <Dots corners="tl br" />
        {strategy.paragraphs.map((p) => (
          <p key={p.slice(0, 24)} className="copy">
            {p}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "calc(var(--unit) * 2)", marginTop: "calc(var(--unit) * 8)" }}>
        {strategy.pillars.map((pillar) => (
          <article key={pillar.number} className="relative bg-card" style={{ padding: "calc(var(--unit) * 4)" }}>
            <Dots corners="tl br" />
            <p className="label" style={{ color: "var(--text-muted)" }}>
              {pillar.number}
            </p>
            <h3 className="font-body text-ink" style={{ fontSize: 18, fontWeight: 400, marginTop: "calc(var(--unit) * 2)" }}>
              {pillar.title}
            </h3>
            <p className="copy" style={{ marginTop: "calc(var(--unit) * 2)" }}>
              {pillar.body}
            </p>
          </article>
        ))}
      </div>

      <dl data-scene-anchor="stats" className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "calc(var(--unit) * 2)", marginTop: "calc(var(--unit) * 8)" }}>
        {strategy.stats.map((s) => (
          <div key={s.label} className="relative bg-card" style={{ padding: "calc(var(--unit) * 4)" }}>
            <Dots corners="br" />
            <dd className="font-pixel text-gold" style={{ fontSize: 20, lineHeight: 1 }}>
              {s.value}
            </dd>
            <dt className="label" style={{ color: "var(--text-muted)", marginTop: "calc(var(--unit) * 2)" }}>
              {s.label}
            </dt>
          </div>
        ))}
      </dl>
    </Section>
  );
}
