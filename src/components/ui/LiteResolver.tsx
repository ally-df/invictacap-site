"use client";

import { useEffect } from "react";
import { useSite } from "@/lib/store";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Decides lite mode once (URL `?lite`, reduced motion, no WebGL), tracks the
 * compact breakpoint, and mirrors store state onto <html> classes.
 */
export function LiteResolver() {
  const lite = useSite((s) => s.lite);
  const phase = useSite((s) => s.phase);
  const menuOpen = useSite((s) => s.menuOpen);
  const setLite = useSite((s) => s.setLite);
  const setCompact = useSite((s) => s.setCompact);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).has("lite");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLite(fromUrl || reduced || !hasWebGL(), true);

    const mq = window.matchMedia("(max-width: 767px)");
    setCompact(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setLite, setCompact]);

  useEffect(() => {
    document.documentElement.classList.toggle("lite", lite);
  }, [lite]);

  useEffect(() => {
    document.documentElement.classList.toggle("locked", phase !== "browse" || menuOpen);
  }, [phase, menuOpen]);

  return null;
}
