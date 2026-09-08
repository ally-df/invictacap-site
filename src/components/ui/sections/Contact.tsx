"use client";

import { contact } from "@/content/site";
import { clickSound, hoverSound } from "@/lib/audio";
import { Dots } from "../Dots";
import { Section } from "../Section";

export function Contact() {
  return (
    <Section id="contact" number={contact.number} label={contact.label} anchor="contact" headline={contact.voxelHeadline}>
      <div className="relative" style={{ padding: "calc(var(--unit) * 2)" }}>
        <Dots corners="tl br" />
        <p className="copy">{contact.body}</p>
      </div>
      <a href={`mailto:${contact.email}`} className="btn hov inline-block" style={{ marginTop: "calc(var(--unit) * 6)" }} {...hoverSound()} {...clickSound()}>
        {contact.cta}
      </a>
    </Section>
  );
}
