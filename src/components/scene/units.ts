"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MARK_SIZE } from "@/lib/voxelMark";
import { useSite } from "@/lib/store";

/**
 * ───────────────────────── World / camera convention ─────────────────────────
 *
 * Single source of truth for how the 3D diorama maps onto the DOM page.
 *
 * Units
 *   1 world unit = 1 grid cell = `unitPx(compact)` CSS px (8 desktop, 4 compact).
 *   `pxToWorld(px, compact)` converts document px → world units.
 *
 * Axes (three.js, right-handed, y-up)
 *   +X  = screen right.
 *   +Y  = up, away from the ground. The ground plane is y = 0; a unit cube resting
 *         on the ground has its centre at y = 0.5.
 *   +Z  = DOWN THE PAGE:  worldZ = pxToWorld(documentTopPx).  Document px 0 is z = 0.
 *
 * Camera (browse)
 *   The camera hovers ABOVE and PAST the point it looks at (larger z), pitched down by
 *   `TILT` (45°) and looking toward -Z, i.e. toward the top of the document. Scrolling
 *   down moves the camera along +Z ("backing up" over the diorama). Ground points earlier
 *   in the document are farther away and higher on screen; later points are nearer and
 *   lower on screen — the same direction the DOM flows.
 *
 *   look-at  = (0, 0, pxToWorld(scrollY + innerHeight / 2))     ← ground under viewport centre
 *   eye      = look-at + (0, L·sin(TILT), L·cos(TILT)) + pointer parallax
 *   L        = browseDistance(innerHeight, compact): chosen so that at the look-at point
 *              1 world unit across (x) ≈ unitPx CSS px, i.e. the diorama's horizontal scale
 *              matches the DOM grid. Depth (z) is foreshortened by sin(45°) ≈ 0.71 on screen,
 *              so set-pieces glide a little slower than the DOM text (a deliberate parallax).
 *
 *   ⇒ A set-piece anchored at document px T (placed at z = pxToWorld(T)) is vertically centred
 *     on screen exactly when scrollY + innerHeight / 2 ≈ T.
 *
 * Camera (gate)
 *   Straight-on, level, at ground height MARK_SIZE/2, looking along -Z at the upright logo mark
 *   standing at (0, 0..8, heroCenterZ). Distance chosen so the mark fills ~1/3 of the viewport
 *   height at GATE_FOV. The intro tweens gate → browse pose over INTRO_MS with `easeCamera`.
 *
 * Text
 *   `layoutText` cells (x right, y down) laid flat on the ground map to (x, 0, y) — readable
 *   from the browse camera; stood upright they map to (x, height-1-y, 0) facing +Z (the camera).
 *
 * DOM column
 *   The UI column is 768px (384px compact): half-width = 48 world units either way. On desktop it
 *   is NOT centred in the viewport (.home-main pads 216px left for the nav / 16px right), so
 *   `useAnchors` measures the column's centre x and the camera shifts so that
 *   **world x = 0 is always the column centre** (`columnShiftX`). Set-pieces flank it at
 *   |x| ≥ FLANK_INNER_X, clamped to the band between the nav (viewport px 0..NAV_PX) and the
 *   viewport's right edge (`flankLimits`); on compact / narrow viewports they sit under the text
 *   at x = 0 in dim grey instead.
 */

export const UNIT_PX_DESKTOP = 8;
export const UNIT_PX_COMPACT = 4;

export const unitPx = (compact: boolean) => (compact ? UNIT_PX_COMPACT : UNIT_PX_DESKTOP);
export const pxToWorld = (px: number, compact: boolean) => px / unitPx(compact);
export const worldToPx = (units: number, compact: boolean) => units * unitPx(compact);

/** Half-width of the centred DOM column, in world units (768/8/2 = 384/4/2 = 48). */
export const COLUMN_HALF_UNITS = 48;
/** Set-pieces flank the column with their inner edge at this |x| (desktop). */
export const FLANK_INNER_X = 50;
/** Narrow pieces may drift outward up to this inner |x| for variety. */
export const FLANK_MAX_INNER_X = 56;
/** Below this viewport half-width (units) there is no room to flank; pieces go behind the text. */
export const FLANK_MIN_HALF_WIDTH = 62;
/** A flank band narrower than this (units) sends the piece behind the text instead. */
export const FLANK_MIN_BAND = 8;
/** The fixed vertical nav occupies viewport px 0..NAV_PX on desktop. */
export const NAV_PX = 200;
/** Set-piece cube size (desktop / behind-text) so they read like the reference's doodles. */
export const PIECE_SCALE = 1.6;
export const PIECE_SCALE_BEHIND = 1.2;
/** The "$100M+" numeral stays at 1x (two lines, 23 units wide, fits the left band). */
export const NUMERAL_SCALE = 1;

/** Camera pitch in browse (the reference's viewXRot = 45°). */
export const TILT = Math.PI / 4;
export const GATE_FOV = 20;
export const BROWSE_FOV = 45;
/** Pointer parallax applied to the camera eye, in world units at pointer = ±1. */
export const PARALLAX_X = 1.6;
export const PARALLAX_Y = 0.8;
/** Fog range as multiples of the browse distance L. */
export const FOG_NEAR_K = 1.05;
export const FOG_FAR_K = 2.4;

/** The floor dot field sits on a 4-unit grid (32px desktop, 16px compact). */
export const GRID_CELL_UNITS = 4;

/** Height (units) at which the gate camera and the standing mark's centre sit. */
export const GATE_EYE_Y = MARK_SIZE / 2;

/** Gate: the standing 8-unit mark is this fraction of the viewport height. */
export const GATE_MARK_VH = 0.3;
/** Gate: the DOM's mark slot is centred this many CSS px above the viewport centre. */
export const GATE_LIFT_PX = 100;
/** Visible world height of the gate view (units). */
export const GATE_VISIBLE_H = MARK_SIZE / GATE_MARK_VH;

/** Gate camera distance so the mark spans GATE_MARK_VH of the viewport at GATE_FOV. */
export function gateDistance() {
  return GATE_VISIBLE_H / 2 / Math.tan((GATE_FOV * Math.PI) / 360);
}

/** GATE_LIFT_PX converted to world units at the gate projection (1 unit = innerHeight / GATE_VISIBLE_H px). */
export function gateLiftUnits(innerHeightPx: number) {
  return (GATE_LIFT_PX * GATE_VISIBLE_H) / Math.max(320, innerHeightPx);
}

/** Browse: distance from eye to the look-at point so 1 unit ≈ unitPx CSS px at that point. */
export function browseDistance(innerHeightPx: number, compact: boolean) {
  const visibleH = pxToWorld(Math.max(320, innerHeightPx), compact);
  return visibleH / 2 / Math.tan((BROWSE_FOV * Math.PI) / 360);
}

/** World z of the ground point under the centre of the first viewport (scrollY = 0). */
export function heroCenterZ(innerHeightPx: number, compact: boolean) {
  return pxToWorld(Math.max(320, innerHeightPx) / 2, compact);
}

/** World z of the ground point under the viewport centre for a given scroll position. */
export function viewCenterZ(scrollY: number, innerHeightPx: number, compact: boolean) {
  return pxToWorld(scrollY + Math.max(320, innerHeightPx) / 2, compact);
}

export function viewportHalfWidthUnits(innerWidthPx: number, compact: boolean) {
  return pxToWorld(innerWidthPx / 2, compact);
}

/**
 * Layout facts measured from the DOM, readable from useFrame without React state.
 * `columnCenterPx` is 0 until a `.col` / anchor element has been measured.
 */
export const sceneLayout = { columnCenterPx: 0 };

/** Effective column centre in viewport px (falls back to the viewport centre). */
export function columnCenterPx(measured: number, innerWidthPx: number) {
  return measured > 0 ? measured : innerWidthPx / 2;
}

/** Camera x offset so that world x = 0 sits at the column centre on screen. */
export function columnShiftX(measured: number, innerWidthPx: number, compact: boolean) {
  return -pxToWorld(columnCenterPx(measured, innerWidthPx) - innerWidthPx / 2, compact);
}

/**
 * Horizontal band available for flanking pieces, in world x (column centre = 0):
 * `left` = just right of the nav, `right` = just inside the viewport's right edge.
 */
export function flankLimits(measured: number, innerWidthPx: number, compact: boolean) {
  const center = columnCenterPx(measured, innerWidthPx);
  const margin = 2;
  return {
    left: -pxToWorld(center - (compact ? 0 : NAV_PX), compact) + margin,
    right: pxToWorld(innerWidthPx - center, compact) - margin,
  };
}

/* ───────────────────────── Viewport hook ───────────────────────── */

const subscribeResize = (cb: () => void) => {
  window.addEventListener("resize", cb);
  window.addEventListener("orientationchange", cb);
  return () => {
    window.removeEventListener("resize", cb);
    window.removeEventListener("orientationchange", cb);
  };
};

/** Window inner size as React state (0×0 on the server). */
export function useViewport() {
  const innerWidth = useSyncExternalStore(
    subscribeResize,
    () => window.innerWidth,
    () => 0,
  );
  const innerHeight = useSyncExternalStore(
    subscribeResize,
    () => window.innerHeight,
    () => 0,
  );
  return { innerWidth: innerWidth || 1280, innerHeight: innerHeight || 800 };
}

/* ───────────────────────── DOM anchors ───────────────────────── */

export const ANCHOR_KEYS = [
  "statement",
  "strategy",
  "stats",
  "sectors",
  "sector-ai",
  "sector-fintech",
  "sector-frontier",
  "approach",
  "notes",
  "partners",
  "contact",
] as const;
export type AnchorKey = (typeof ANCHOR_KEYS)[number];

export type Anchor = { top: number; height: number };
export type AnchorMap = Partial<Record<string, Anchor>>;

/** Fallback section tops (multiples of innerHeight) used when the DOM emits no anchors. */
export const FALLBACK_ANCHORS_VH: Record<AnchorKey, number> = {
  statement: 1.0,
  strategy: 2.0,
  stats: 2.8,
  sectors: 3.4,
  "sector-ai": 3.8,
  "sector-fintech": 4.6,
  "sector-frontier": 5.4,
  approach: 6.4,
  notes: 7.4,
  partners: 8.2,
  contact: 9.2,
};
export const FALLBACK_ANCHOR_HEIGHT_VH = 0.8;

/** Resolve an anchor from the measured map or the vh fallback. */
export function resolveAnchor(anchors: AnchorMap, key: AnchorKey, innerHeightPx: number): Anchor {
  const a = anchors[key];
  if (a && Number.isFinite(a.top)) return a;
  return { top: FALLBACK_ANCHORS_VH[key] * innerHeightPx, height: FALLBACK_ANCHOR_HEIGHT_VH * innerHeightPx };
}

/** Document px at which a section's set-piece should be screen-centred. */
export function anchorFocusPx(a: Anchor, innerHeightPx: number) {
  return a.top + Math.min(a.height / 2, innerHeightPx * 0.45);
}

/**
 * Assembly progress for a piece whose section starts at `top`:
 * 0 while the section top is still ≥ 1.1vh below the viewport top, 1 once it has risen to 0.3vh.
 */
export function assemblyProgress(top: number, scrollY: number, innerHeightPx: number) {
  const center = scrollY + innerHeightPx / 2;
  const p = (center - (top - innerHeightPx * 0.6)) / (innerHeightPx * 0.8);
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

type AnchorsState = { anchors: AnchorMap; docHeight: number; columnCenterPx: number; key: string };
const EMPTY: AnchorsState = { anchors: {}, docHeight: 0, columnCenterPx: 0, key: "" };

function measureAnchors(): AnchorsState {
  const anchors: AnchorMap = {};
  const parts: string[] = [];
  const nodes = document.querySelectorAll<HTMLElement>("[data-scene-anchor]");
  const scrollY = window.scrollY || 0;
  nodes.forEach((el) => {
    const k = el.dataset.sceneAnchor;
    if (!k) return;
    const r = el.getBoundingClientRect();
    const top = Math.round(r.top + scrollY);
    const height = Math.round(r.height);
    anchors[k] = { top, height };
    parts.push(`${k}:${top}:${height}`);
  });
  const docHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body?.scrollHeight ?? 0,
    window.innerHeight,
  );
  // Column centre: a `.col` inside the statement section, else any `.col`, else the section itself.
  const colEl =
    document.querySelector<HTMLElement>('[data-scene-anchor="statement"] .col') ??
    document.querySelector<HTMLElement>("main .col") ??
    document.querySelector<HTMLElement>('[data-scene-anchor="statement"]');
  let centerX = 0;
  if (colEl) {
    const r = colEl.getBoundingClientRect();
    if (r.width > 0) centerX = Math.round(r.left + r.width / 2);
  }
  sceneLayout.columnCenterPx = centerX;
  parts.push(`doc:${docHeight}`, `col:${centerX}`);
  return { anchors, docHeight, columnCenterPx: centerX, key: parts.join("|") };
}

/**
 * Positions of `[data-scene-anchor]` elements in document px (top = rect.top + scrollY), plus the
 * document height. Re-measured on mount, resize (ResizeObserver on <body>), phase change, and
 * polled a few times while the list is still empty (the UI may mount after the scene).
 */
export function useAnchors(): { anchors: AnchorMap; docHeight: number; columnCenterPx: number } {
  const [state, setState] = useState<AnchorsState>(EMPTY);
  const phase = useSite((s) => s.phase);
  const compact = useSite((s) => s.compact);

  useEffect(() => {
    let disposed = false;
    const timers: number[] = [];
    let raf = 0;

    const measure = () => {
      if (disposed) return;
      const next = measureAnchors();
      setState((prev) => (prev.key === next.key ? prev : next));
      return next;
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        measure();
      });
    };

    // Initial measurement + a short poll while no anchors exist yet.
    let attempts = 0;
    const poll = () => {
      if (disposed) return;
      const next = measure();
      const found = next ? Object.keys(next.anchors).length > 0 : false;
      if (!found && attempts++ < 12) timers.push(window.setTimeout(poll, 250 * Math.min(attempts, 4)));
    };
    timers.push(window.setTimeout(poll, 0));
    // The gate → browse layout shift can settle over ~1s (nav slide-in, gate unmount).
    timers.push(window.setTimeout(schedule, 150), window.setTimeout(schedule, 600), window.setTimeout(schedule, 1400));

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (ro && document.body) ro.observe(document.body);
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    if (document.fonts?.ready) document.fonts.ready.then(schedule, () => undefined);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      ro?.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
    };
  }, [phase, compact]);

  return { anchors: state.anchors, docHeight: state.docHeight, columnCenterPx: state.columnCenterPx };
}
