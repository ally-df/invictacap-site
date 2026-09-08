import { approach } from "@/content/site";
import { Dots } from "../Dots";
import { Section } from "../Section";

export function Approach() {
  return (
    <Section id="approach" number={approach.number} label={approach.label} anchor="approach" headline={approach.voxelHeadline}>
      <div className="relative flex flex-col" style={{ gap: "calc(var(--unit) * 3)", padding: "calc(var(--unit) * 2)" }}>
        <Dots corners="tl br" />
        {approach.paragraphs.map((p) => (
          <p key={p.slice(0, 24)} className="copy">
            {p}
          </p>
        ))}
      </div>

      <ol className="flex flex-col" style={{ gap: "calc(var(--unit) * 2)", marginTop: "calc(var(--unit) * 8)" }}>
        {approach.principles.map((p, i) => (
          <li key={p} className="flex items-baseline" style={{ gap: "calc(var(--unit) * 3)" }}>
            <span className="label" style={{ color: "var(--text-muted)" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-body text-ink" style={{ fontSize: 16, fontWeight: 400 }}>
              {p}
            </span>
          </li>
        ))}
      </ol>

      <dl className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "calc(var(--unit) * 2)", marginTop: "calc(var(--unit) * 8)" }}>
        {approach.stats.map((s) => (
          <div key={s.label} className="relative" style={{ padding: "calc(var(--unit) * 2) 0 calc(var(--unit) * 2) calc(var(--unit) * 2)" }}>
            <Dots corners="tl" />
            <dt className="label" style={{ color: "var(--text-muted)" }}>
              {s.label}
            </dt>
            <dd className="font-pixel text-gold" style={{ fontSize: 12, marginTop: "calc(var(--unit) * 1.5)" }}>
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
