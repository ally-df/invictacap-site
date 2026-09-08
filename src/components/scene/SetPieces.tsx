"use client";

import { useMemo } from "react";
import { useSite } from "@/lib/store";
import Cubes, { type IdleFn } from "./Cubes";
import {
  aiLattice,
  approachTrio,
  contactSeal,
  fintechLedger,
  frontierTower,
  notesBook,
  partnersFrames,
  statementLattice,
  statsNumeral,
  strategyPillars,
  type Shape,
} from "./shapes";
import {
  FLANK_INNER_X,
  FLANK_MAX_INNER_X,
  FLANK_MIN_BAND,
  NUMERAL_SCALE,
  PIECE_SCALE,
  PIECE_SCALE_BEHIND,
  anchorFocusPx,
  assemblyProgress,
  flankLimits,
  pxToWorld,
  resolveAnchor,
  useViewport,
  type AnchorKey,
  type AnchorMap,
} from "./units";

type PieceDef = { key: AnchorKey; side: 1 | -1; build: () => Shape; seed: number; scale?: number };

/** Alternating sides down the page; the fixed nav lives on the far left, pieces stay inside it. */
const PIECES: readonly PieceDef[] = [
  { key: "statement", side: -1, build: statementLattice, seed: 21 },
  { key: "strategy", side: 1, build: strategyPillars, seed: 22 },
  { key: "stats", side: -1, build: statsNumeral, seed: 23, scale: NUMERAL_SCALE },
  { key: "sector-ai", side: 1, build: aiLattice, seed: 24 },
  { key: "sector-fintech", side: -1, build: fintechLedger, seed: 25 },
  { key: "sector-frontier", side: 1, build: frontierTower, seed: 26 },
  { key: "approach", side: -1, build: approachTrio, seed: 27 },
  { key: "notes", side: 1, build: notesBook, seed: 28 },
  { key: "partners", side: -1, build: partnersFrames, seed: 29 },
  { key: "contact", side: 1, build: contactSeal, seed: 30 },
];

/** Frontier drifters: rise 12 units above the tower top and loop, staggered. */
const DRIFT_LOOP = 12;
const driftIdle: IdleFn = (i, t) => (t * 2.5 + i * 4) % DRIFT_LOOP;

type Placement = { ox: number; size: number; behind: boolean };

/**
 * Where a piece of `width` shape cells goes on `side`, given the flank band [left, right] in world x
 * (column centre = 0). Inner edge at FLANK_INNER_X (+ a little outward drift for narrow pieces),
 * tucked in so the outer edge clears the nav / viewport edge; too narrow a band → behind the text.
 */
function place(width: number, side: 1 | -1, left: number, right: number, scale: number, forceBehind: boolean): Placement {
  const band = side > 0 ? right - FLANK_INNER_X : -left - FLANK_INNER_X;
  if (forceBehind || band < FLANK_MIN_BAND) {
    const size = forceBehind ? PIECE_SCALE_BEHIND : scale;
    return { ox: (-width * size) / 2, size, behind: true };
  }
  // Shrink (down to 1x) rather than overlap the column when the band is tight.
  const size = Math.max(1, Math.min(scale, band / width));
  const w = width * size;
  const outerLimit = side > 0 ? right : -left;
  const spread = Math.max(0, Math.min(FLANK_MAX_INNER_X - FLANK_INNER_X, (28 - w) / 2));
  const inner = Math.max(FLANK_INNER_X - 1, Math.min(FLANK_INNER_X + spread, outerLimit - w));
  return { ox: side > 0 ? inner : -inner - w, size, behind: false };
}

/**
 * Abstract sculptures anchored to the DOM sections. Each assembles (`rise`) as its section
 * scrolls into view; anchors come from `[data-scene-anchor]` with vh fallbacks (see units.ts).
 * Desktop: flanking the column between the nav and the viewport edge. Compact: dim grey under the text.
 */
export default function SetPieces({ anchors, columnCenterPx }: { anchors: AnchorMap; columnCenterPx: number }) {
  const compact = useSite((s) => s.compact);
  const { innerWidth, innerHeight } = useViewport();
  const { left, right } = flankLimits(columnCenterPx, innerWidth, compact);
  const shapes = useMemo(() => PIECES.map((p) => p.build()), []);

  return (
    <>
      {PIECES.map((p, i) => {
        const shape = shapes[i];
        const a = resolveAnchor(anchors, p.key, innerHeight);
        const zc = pxToWorld(anchorFocusPx(a, innerHeight), compact);
        const { ox, size, behind } = place(shape.width, p.side, left, right, p.scale ?? PIECE_SCALE, compact);
        const oz = zc - (shape.depth * size) / 2;
        const top = a.top;
        const progress = () => {
          const s = useSite.getState();
          if (s.phase !== "browse") return 0;
          return assemblyProgress(top, s.scrollY, window.innerHeight);
        };
        return (
          <group key={p.key}>
            <Cubes
              cells={shape.cells}
              origin={[ox, 0, oz]}
              size={size}
              color={behind ? "grey" : "gold"}
              dim={behind}
              seed={p.seed}
              progress={progress}
              assemble="rise"
            />
            {shape.drift ? (
              <Cubes
                cells={shape.drift}
                origin={[ox, 0, oz]}
                size={size}
                color={behind ? "grey" : "gold"}
                dim={behind}
                seed={p.seed + 100}
                progress={progress}
                assemble="rise"
                idle={driftIdle}
                idleRange={DRIFT_LOOP + 2}
              />
            ) : null}
          </group>
        );
      })}
    </>
  );
}
