"use client";

import { brand, disclaimer } from "@/content/site";
import { clickSound, hoverSound } from "@/lib/audio";

export function Footer() {
  return (
    <footer className="col relative" style={{ paddingTop: "calc(var(--unit) * 8)", paddingBottom: "calc(var(--unit) * 32)" }}>
      <span aria-hidden="true" className="dot" style={{ marginBottom: "calc(var(--unit) * 4)" }} />
      <p className="font-body" style={{ fontSize: 13, color: "var(--text-2)" }}>
        {brand.copyright}
      </p>
      <ul className="flex flex-wrap" style={{ gap: "calc(var(--unit) * 4)", marginTop: "calc(var(--unit) * 2)" }}>
        <li>
          <a href={`mailto:${brand.email}`} className="hov label" {...hoverSound()} {...clickSound()}>
            Email
          </a>
        </li>
        <li>
          <a href={brand.linkedin} target="_blank" rel="noopener noreferrer" className="hov label" {...hoverSound()} {...clickSound()}>
            LinkedIn
          </a>
        </li>
      </ul>
      <p className="font-body" style={{ fontSize: 11, lineHeight: 1.7, color: "var(--text-muted)", marginTop: "calc(var(--unit) * 6)" }}>
        {disclaimer}
      </p>
    </footer>
  );
}
