import { partners } from "@/content/site";
import { PartnerTile } from "../PartnerTile";
import { Section } from "../Section";

export function Partners() {
  return (
    <Section id="partners" number={partners.number} label={partners.label} anchor="partners" headline={partners.voxelHeadline}>
      <ul className="flex flex-wrap" style={{ gap: "calc(var(--unit) * 8)" }}>
        {partners.people.map((p) => (
          <li key={p.email}>
            <PartnerTile {...p} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
