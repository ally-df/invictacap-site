import type { Metadata } from "next";
import Link from "next/link";
import { brand, seo } from "@/content/site";
import { essay, type EssayBlock } from "@/content/essay";
import { MarkSvg } from "@/components/ui/MarkSvg";
import { PixelText } from "@/components/ui/PixelText";
import { Dots } from "@/components/ui/Dots";
import { EssayFigure } from "@/components/ui/EssayFigures";

export const metadata: Metadata = {
  title: `${essay.title} | ${brand.name}`,
  description: essay.dek,
  alternates: { canonical: `${seo.url}/insights/${essay.slug}` },
  openGraph: {
    title: essay.title,
    description: essay.dek,
    url: `${seo.url}/insights/${essay.slug}`,
    type: "article",
    siteName: brand.name,
  },
};

const u = (n: number) => `calc(var(--unit) * ${n})`;

function Block({ block }: { block: EssayBlock }) {
  switch (block.type) {
    case "p":
      return <p className={block.drop ? "drop" : undefined}>{block.text}</p>;
    case "pull":
      return (
        <blockquote className="relative" style={{ margin: `${u(6)} 0`, padding: `${u(3)} ${u(4)}` }}>
          <Dots corners="tl br" />
          <p className="pull">{block.text}</p>
        </blockquote>
      );
    case "figure":
      return (
        <figure className="relative bg-card" style={{ margin: `${u(6)} 0`, padding: u(4) }}>
          <Dots corners="tl br" muted />
          <EssayFigure kind={block.figure} />
          <figcaption className="label" style={{ color: "var(--text-muted)", letterSpacing: "0.12em", marginTop: u(3), lineHeight: 1.7 }}>
            {block.caption}
          </figcaption>
        </figure>
      );
  }
}

export default function EssayPage() {
  return (
    <div className="grid-bg min-h-screen" style={{ paddingInline: u(4) }}>
      <header className="col" style={{ paddingBlock: u(4) }}>
        <Link href="/" className="hov text-gold inline-flex items-center" style={{ gap: u(2) }} aria-label={`${brand.name} — home`}>
          <MarkSvg size={32} />
          <PixelText as="span" lines={[brand.wordmark]} cell={3} fixed />
        </Link>
      </header>

      <main className="col" style={{ paddingTop: u(16), paddingBottom: u(32) }}>
        <article className="essay">
          <p className="label" style={{ color: "var(--text-muted)" }}>
            {essay.category} · {essay.year}
          </p>
          <PixelText as="h1" lines={essay.voxelTitle} cell={16} className="text-gold" style={{ marginTop: u(6) }} />
          <p className="font-display italic text-gold" style={{ fontSize: 24, lineHeight: 1.3, marginTop: u(6), maxWidth: "40ch" }}>
            {essay.dek}
          </p>
          <p className="label" style={{ color: "var(--text-2)", marginTop: u(4) }}>
            {essay.byline}
          </p>

          {essay.sections.map((s) => (
            <section key={s.numeral} style={{ marginTop: u(16) }}>
              <div className="relative" style={{ paddingLeft: u(2) }}>
                <Dots corners="tl" />
                <p className="label" style={{ color: "var(--text-muted)" }}>
                  {s.numeral}
                </p>
                <h2 className="font-pixel text-gold" style={{ fontSize: 18, marginTop: u(2), letterSpacing: "0.05em" }}>
                  {s.title}
                </h2>
              </div>
              <div style={{ marginTop: u(6) }}>
                {s.blocks.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </div>
            </section>
          ))}

          <section style={{ marginTop: u(16) }}>
            <p className="label" style={{ color: "var(--text-muted)" }}>
              Sources
            </p>
            <ol className="flex flex-col" style={{ gap: u(3), marginTop: u(4) }}>
              {essay.sources.map((src) => (
                <li key={src.n} className="flex items-baseline" style={{ gap: u(3) }}>
                  <span className="label" style={{ color: "var(--text-muted)" }}>
                    {String(src.n).padStart(2, "0")}
                  </span>
                  <span className="font-body" style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-2)" }}>
                    <a href={src.href} target="_blank" rel="noopener noreferrer" className="hov text-gold">
                      {src.org} — {src.title}
                    </a>{" "}
                    {src.note}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <p className="font-body" style={{ fontSize: 11, lineHeight: 1.7, color: "var(--text-muted)", marginTop: u(12) }}>
            {essay.disclaimer}
          </p>

          <div className="text-gold" style={{ marginTop: u(12) }}>
            <MarkSvg size={24} title={brand.name} />
          </div>
        </article>
      </main>
    </div>
  );
}
