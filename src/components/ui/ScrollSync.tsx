"use client";

import { useEffect } from "react";
import { useSite } from "@/lib/store";

/** Mirrors window scroll and pointer position into the store, throttled to one write per frame. */
export function ScrollSync() {
  useEffect(() => {
    const { setScrollY, setPointer } = useSite.getState();
    let scrollRaf = 0;
    let pointerRaf = 0;
    let px = 0;
    let py = 0;

    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        setScrollY(window.scrollY);
      });
    };

    const onPointer = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = -((e.clientY / window.innerHeight) * 2 - 1);
      if (pointerRaf) return;
      pointerRaf = requestAnimationFrame(() => {
        pointerRaf = 0;
        setPointer(px, py);
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") setScrollY(window.scrollY);
    };

    setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      if (pointerRaf) cancelAnimationFrame(pointerRaf);
    };
  }, []);

  return null;
}
