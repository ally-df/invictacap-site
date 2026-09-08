import { statement } from "@/content/site";
import { Dots } from "../Dots";
import { Section } from "../Section";

export function Statement() {
  return (
    <Section id="statement" number={statement.number} label={statement.label} anchor="statement" headline={statement.voxelHeadline} headingAs="h1">
      <p className="font-display italic text-gold" style={{ fontSize: "clamp(22px, 3.2vw, 32px)", lineHeight: 1.2, fontWeight: 400 }}>
        {statement.headline} <em>{statement.headlineEm}</em>
      </p>
      <div className="relative" style={{ marginTop: "calc(var(--unit) * 6)", padding: "calc(var(--unit) * 2) 0" }}>
        <Dots corners="tl br" />
        <p className="copy primary" style={{ padding: "0 calc(var(--unit) * 2)" }}>
          {statement.body}
        </p>
      </div>
    </Section>
  );
}
