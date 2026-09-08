import { sectors, type SectorKey } from "@/content/site";
import { Dots } from "../Dots";
import { Section } from "../Section";

/** 5x5 pixel glyphs: lattice (AI), stacked bars (fintech), upward arrow (frontier). */
const GLYPHS: Record<SectorKey, readonly string[]> = {
  ai: ["#.#.#", ".....", "#.#.#", ".....", "#.#.#"],
  fintech: ["#####", ".....", "###..", ".....", "####."],
  frontier: ["..#..", ".###.", "#.#.#", "..#..", "..#.."],
};

function Glyph({ bitmap }: { bitmap: readonly string[] }) {
  const rects: { x: number; y: number }[] = [];
  bitmap.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === "#") rects.push({ x, y });
  });
  return (
    <svg aria-hidden="true" viewBox="0 0 5 5" shapeRendering="crispEdges" fill="currentColor" style={{ display: "block", width: "calc(var(--unit) * 2.5)", height: "calc(var(--unit) * 2.5)" }}>
      {rects.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={1} height={1} />
      ))}
    </svg>
  );
}

export function Sectors() {
  return (
    <Section id="sectors" number={sectors.number} label={sectors.label} anchor="sectors" headline={sectors.voxelHeadline}>
      <div className="flex flex-col" style={{ gap: "calc(var(--unit) * 2)" }}>
        {sectors.items.map((item) => (
          <article
            key={item.key}
            data-scene-anchor={`sector-${item.key}`}
            className="relative bg-card grid grid-cols-[auto_1fr] items-start"
            style={{ gap: "calc(var(--unit) * 4)", padding: "calc(var(--unit) * 4)" }}
          >
            <Dots corners="tl br" />
            <div className="flex items-center justify-center text-gold" style={{ width: "calc(var(--unit) * 5 + 2px)", height: "calc(var(--unit) * 5 + 2px)", boxShadow: "inset 0 0 0 1px var(--gold)" }}>
              <Glyph bitmap={GLYPHS[item.key]} />
            </div>
            <div>
              <p className="label" style={{ color: "var(--text-muted)" }}>
                {item.number}
              </p>
              <h3 className="font-body text-ink" style={{ fontSize: 18, fontWeight: 400, marginTop: "var(--unit)" }}>
                {item.title}
              </h3>
              <p className="copy" style={{ marginTop: "calc(var(--unit) * 2)" }}>
                {item.body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
