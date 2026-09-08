"use client";

import { create } from "zustand";

/**
 * gate   — landing block visible, scene idle, scroll locked
 * intro  — Enter pressed; cubes scatter, camera pulls back (~2.4s)
 * browse — nav visible, scroll unlocked, camera follows scroll
 */
export type Phase = "gate" | "intro" | "browse";

export type SiteState = {
  phase: Phase;
  /** Timestamp (performance.now) when the intro began; used by the scene for timing. */
  introStartedAt: number;
  sound: boolean;
  lite: boolean;
  /** True once we've decided lite from URL / reduced-motion / WebGL support. */
  liteResolved: boolean;
  /** Mobile (half-scale) layout, set by a matchMedia listener in the UI. */
  compact: boolean;
  menuOpen: boolean;
  /** Pointer position in normalized device coords (-1..1), for the scene's proximity effects. */
  pointer: { x: number; y: number };
  /** Current DOM scroll position in px (the scene damps toward this). */
  scrollY: number;
  /** True once the WebGL scene has rendered its first frame (the DOM gate shows a fallback mark until then). */
  sceneReady: boolean;

  enter: () => void;
  finishIntro: () => void;
  setSound: (on: boolean) => void;
  toggleSound: () => void;
  setLite: (on: boolean, resolved?: boolean) => void;
  toggleLite: () => void;
  setCompact: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setPointer: (x: number, y: number) => void;
  setScrollY: (y: number) => void;
  setSceneReady: (v: boolean) => void;
};

export const useSite = create<SiteState>((set, get) => ({
  phase: "gate",
  introStartedAt: 0,
  sound: true,
  lite: false,
  liteResolved: false,
  compact: false,
  menuOpen: false,
  pointer: { x: 0, y: 0 },
  scrollY: 0,
  sceneReady: false,

  enter: () => {
    if (get().phase !== "gate") return;
    set({ phase: "intro", introStartedAt: typeof performance !== "undefined" ? performance.now() : Date.now() });
  },
  finishIntro: () => {
    if (get().phase === "intro") set({ phase: "browse" });
  },
  setSound: (sound) => set({ sound }),
  toggleSound: () => set({ sound: !get().sound }),
  setLite: (lite, resolved = true) => set({ lite, liteResolved: resolved }),
  toggleLite: () => set({ lite: !get().lite, liteResolved: true }),
  setCompact: (compact) => set({ compact }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setScrollY: (scrollY) => set({ scrollY }),
  setSceneReady: (sceneReady) => set({ sceneReady }),
}));

/** Intro duration in ms (camera pull-back), matching the reference. */
export const INTRO_MS = 2400;
