"use client";

import { hoverSound, clickSound } from "@/lib/audio";

type Props = {
  initials: string;
  name: string;
  title: string;
  email: string;
};

/** 88px double-framed square tile with pixel initials, name, title and mailto. */
export function PartnerTile({ initials, name, title, email }: Props) {
  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--unit) * 3)", paddingTop: "var(--unit)", paddingLeft: "var(--unit)" }}>
      <div className="tile-frame relative bg-card flex items-center justify-center" style={{ width: "calc(var(--unit) * 11)", height: "calc(var(--unit) * 11)" }}>
        <span aria-hidden="true" className="font-pixel text-gold" style={{ fontSize: "calc(var(--unit) * 2)", letterSpacing: "0.1em" }}>
          {initials}
        </span>
      </div>
      <div className="flex flex-col" style={{ gap: "var(--unit)" }}>
        <h3 className="font-body text-ink" style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.3 }}>
          {name}
        </h3>
        <p className="label text-ink-muted" style={{ color: "var(--text-muted)" }}>
          {title}
        </p>
        <a href={`mailto:${email}`} className="hov label" style={{ letterSpacing: "0.12em", textTransform: "none" }} {...hoverSound()} {...clickSound()}>
          {email}
        </a>
      </div>
    </div>
  );
}
