"use client";

import { useSite } from "./store";

/**
 * Synthesized UI blips via Web Audio. No audio files.
 * The AudioContext is created lazily on the first user gesture (autoplay policy).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Call from a user gesture (Enter click) to unlock audio. */
export function unlockAudio() {
  getCtx();
}

type BlipKind = "hover" | "click" | "enter" | "toggle";

function tone(freqStart: number, freqEnd: number, duration: number, type: OscillatorType, gain = 1) {
  const c = getCtx();
  if (!c || !master) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, now);
  if (freqEnd !== freqStart) osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

let lastHover = 0;

export function blip(kind: BlipKind) {
  const { sound, phase } = useSite.getState();
  if (!sound) return;
  // Before Enter there has been no gesture; only the Enter click itself may sound.
  if (phase === "gate" && kind !== "enter") return;
  switch (kind) {
    case "hover": {
      const t = performance.now();
      if (t - lastHover < 45) return; // debounce rapid hover storms
      lastHover = t;
      tone(1320, 1320, 0.045, "square", 0.35);
      break;
    }
    case "click":
      tone(660, 990, 0.09, "square", 0.6);
      break;
    case "toggle":
      tone(880, 440, 0.12, "triangle", 0.5);
      break;
    case "enter":
      tone(440, 880, 0.18, "square", 0.7);
      setTimeout(() => tone(880, 1760, 0.22, "square", 0.5), 120);
      break;
  }
}

/** Spread on any interactive element: `{...hoverSound()}` */
export function hoverSound() {
  return {
    onMouseEnter: () => blip("hover"),
    onFocus: () => blip("hover"),
  };
}

export function clickSound() {
  return { onClick: () => blip("click") };
}
