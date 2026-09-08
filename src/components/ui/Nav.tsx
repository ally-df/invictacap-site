"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { brand, nav } from "@/content/site";
import { useSite } from "@/lib/store";
import { blip, hoverSound } from "@/lib/audio";
import { MarkSvg } from "./MarkSvg";
import { scrollToId } from "./scrollTo";

/** Tracks which section crosses the viewport's middle band. */
function useCurrentSection() {
  const [current, setCurrent] = useState<string>("");
  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return current;
}

type ToggleProps = {
  name: string;
  options: readonly [string, string];
  /** Index of the active option. */
  active: 0 | 1;
  checked: boolean;
  ariaLabel: string;
  onToggle: () => void;
};

function Toggle({ name, options, active, checked, ariaLabel, onToggle }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className="hov label flex items-baseline text-left"
      style={{ gap: "calc(var(--unit) * 2)" }}
      onClick={() => {
        blip("toggle");
        onToggle();
      }}
      {...hoverSound()}
    >
      <span style={{ color: "var(--text-muted)", minWidth: "5ch" }}>{name}</span>
      <span>
        {options.map((o, i) => (
          <span key={o}>
            {i > 0 && <span style={{ color: "var(--text-muted)" }}> / </span>}
            <span style={{ color: i === active ? undefined : "var(--text-muted)" }}>{o}</span>
          </span>
        ))}
      </span>
    </button>
  );
}

function NavList({ current, onNavigate }: { current: string; onNavigate?: () => void }) {
  const lite = useSite((s) => s.lite);
  const sound = useSite((s) => s.sound);
  const toggleLite = useSite((s) => s.toggleLite);
  const toggleSound = useSite((s) => s.toggleSound);

  const go = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    blip("click");
    onNavigate?.();
    // Let a closing drawer release the scroll lock before scrolling.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id)));
  };

  return (
    <>
      <a href="#top" aria-label={`${brand.name} — back to top`} className="hov text-gold block w-8 h-8" onClick={go("top")} {...hoverSound()}>
        <MarkSvg size="100%" />
      </a>
      <span aria-hidden="true" className="dot" style={{ marginBlock: "calc(var(--unit) * 4) calc(var(--unit) * 2)" }} />
      <ul className="flex flex-col" style={{ gap: "calc(var(--unit) * 1.5)" }}>
        {nav.map((n) => {
          const isCurrent = current === n.id;
          return (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={isCurrent ? "location" : undefined}
                className="hov label flex"
                style={{ gap: "calc(var(--unit) * 2)", color: isCurrent ? "var(--text)" : undefined }}
                onClick={go(n.id)}
                {...hoverSound()}
              >
                <span style={{ color: "var(--text-muted)" }}>{n.number}</span>
                <span>{n.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col" style={{ gap: "calc(var(--unit) * 1.5)", marginTop: "calc(var(--unit) * 6)" }}>
        <Toggle name="View" options={["Default", "Lite"]} active={lite ? 1 : 0} checked={lite} ariaLabel="Lite view" onToggle={toggleLite} />
        <Toggle name="Sound" options={["On", "Off"]} active={sound ? 0 : 1} checked={sound} ariaLabel="Sound" onToggle={toggleSound} />
      </div>
    </>
  );
}

function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls="site-drawer"
      className="hov fixed z-50 flex flex-col justify-center text-gold"
      style={{ top: "calc(var(--unit) * 4)", left: "calc(var(--unit) * 4)", width: 40, height: 40, gap: 4, padding: 12 }}
      onClick={onClick}
      {...hoverSound()}
    >
      {open ? (
        <span aria-hidden="true" className="block font-pixel" style={{ fontSize: 14, lineHeight: 1 }}>
          X
        </span>
      ) : (
        [0, 1, 2].map((i) => (
          <span key={i} aria-hidden="true" className="block" style={{ width: 16, height: 2, background: "currentColor" }} />
        ))
      )}
    </button>
  );
}

/** Fixed vertical nav (desktop, z-30) or hamburger + full-height drawer (compact, z-40/50). */
export function Nav() {
  const phase = useSite((s) => s.phase);
  const compact = useSite((s) => s.compact);
  const menuOpen = useSite((s) => s.menuOpen);
  const setMenuOpen = useSite((s) => s.setMenuOpen);
  const current = useCurrentSection();
  const shown = phase === "browse";

  useEffect(() => {
    if (!compact && menuOpen) setMenuOpen(false);
  }, [compact, menuOpen, setMenuOpen]);

  if (compact) {
    if (!shown) return null;
    return (
      <>
        <Hamburger
          open={menuOpen}
          onClick={() => {
            blip("click");
            setMenuOpen(!menuOpen);
          }}
        />
        {menuOpen && (
          <nav id="site-drawer" aria-label="Sections" className="fixed inset-0 z-40 grid-bg bg-bg overflow-y-auto" style={{ padding: "calc(var(--unit) * 16) calc(var(--unit) * 6) calc(var(--unit) * 8)" }}>
            <NavList current={current} onNavigate={() => setMenuOpen(false)} />
          </nav>
        )}
      </>
    );
  }

  return (
    <nav
      aria-label="Sections"
      className={["nav-panel fixed top-0 left-0 z-30", shown ? "in" : ""].join(" ")}
      style={{ width: 200, padding: "calc(var(--unit) * 3)" }}
      aria-hidden={!shown}
    >
      <NavList current={current} />
    </nav>
  );
}
