"use client";

import Link from "next/link";
import { notes } from "@/content/site";
import { clickSound, hoverSound } from "@/lib/audio";
import { Dots } from "../Dots";
import { PixelText } from "../PixelText";
import { Section } from "../Section";

export function Notes() {
  const f = notes.featured;
  return (
    <Section id="notes" number={notes.number} label={notes.label} anchor="notes" headline={notes.voxelHeadline}>
      <article className="relative bg-card" style={{ padding: "calc(var(--unit) * 6)" }}>
        <Dots corners="tl br" double />
        <p className="label" style={{ color: "var(--text-muted)" }}>
          {f.category} · {f.year}
        </p>
        <Link href={f.href} className="hov text-gold block" style={{ marginTop: "calc(var(--unit) * 4)" }} {...hoverSound()} {...clickSound()}>
          <PixelText as="h3" lines={[f.title]} cell={8} />
        </Link>
        <p className="copy" style={{ marginTop: "calc(var(--unit) * 4)" }}>
          {f.dek}
        </p>
        <Link href={f.href} className="hov label inline-block" style={{ marginTop: "calc(var(--unit) * 6)" }} {...hoverSound()} {...clickSound()}>
          {f.cta} →
        </Link>
      </article>
    </Section>
  );
}
