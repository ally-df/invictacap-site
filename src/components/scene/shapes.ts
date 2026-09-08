"use client";

import { layoutText } from "@/lib/pixelFont";
import { markCells } from "@/lib/voxelMark";
import { flatCells, uprightCells, type CubeCell } from "./Cubes";
import { GOLD_LIGHT } from "./materials";

/** A set-piece: cells in shape space (min corner at 0,0,0) plus its footprint. */
export type Shape = {
  cells: CubeCell[];
  width: number; // x extent
  depth: number; // z extent
  height: number; // y extent
  /** Optional detached cubes with their own idle animation (frontier drifters). */
  drift?: CubeCell[];
};

const push = (cells: CubeCell[], x: number, y: number, z: number, c?: CubeCell["c"]) => {
  cells.push(c ? { x, y, z, c } : { x, y, z });
};

/** Edge-only shell of an n³ cube at (bx, by, bz). */
function frameCube(cells: CubeCell[], n: number, bx: number, by: number, bz: number, c?: CubeCell["c"]) {
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++)
      for (let z = 0; z < n; z++) {
        const onEdge = (x === 0 || x === n - 1 ? 1 : 0) + (y === 0 || y === n - 1 ? 1 : 0) + (z === 0 || z === n - 1 ? 1 : 0);
        if (onEdge >= 2) push(cells, bx + x, by + y, bz + z, c);
      }
}

/** 01 STATEMENT — a low lattice: 3×2 hollow 3³ frames in grey with a single gold cube inside one. */
export function statementLattice(): Shape {
  const cells: CubeCell[] = [];
  for (let gx = 0; gx < 3; gx++) for (let gz = 0; gz < 2; gz++) frameCube(cells, 3, gx * 4, 0, gz * 4, "grey");
  push(cells, 5, 1, 1, "gold");
  return { cells, width: 11, depth: 7, height: 3 };
}

/** 02 STRATEGY — two stepped gold pillars, 6 and 9 high. */
export function strategyPillars(): Shape {
  const cells: CubeCell[] = [];
  const pillar = (bx: number, tiers: [number, number, number]) => {
    const [h3, h2, h1] = tiers;
    const total = h3 + h2 + h1;
    for (let l = 0; l < total; l++) {
      const n = l < h3 ? 3 : l < h3 + h2 ? 2 : 1;
      const off = (3 - n) >> 1;
      for (let x = 0; x < n; x++) for (let z = 0; z < n; z++) push(cells, bx + off + x, l, off + z);
    }
  };
  pillar(0, [2, 2, 2]);
  pillar(5, [3, 3, 3]);
  return { cells, width: 8, depth: 3, height: 9 };
}

/** 02 STRATEGY stats — "$100M+" on two lines as an upright gold numeral, one cube deep. */
export function statsNumeral(): Shape {
  const t = layoutText(["$100", "M+"], "center");
  return { cells: uprightCells(t.cells, t.height), width: t.width, depth: 1, height: t.height };
}

/** 03 SECTORS / Enterprise AI — a 5³ lattice: edges + centre cross in grey, gold nodes at the corners. */
export function aiLattice(): Shape {
  const cells: CubeCell[] = [];
  const n = 5;
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++)
      for (let z = 0; z < n; z++) {
        const ex = x === 0 || x === n - 1;
        const ey = y === 0 || y === n - 1;
        const ez = z === 0 || z === n - 1;
        const onEdge = (ex ? 1 : 0) + (ey ? 1 : 0) + (ez ? 1 : 0);
        const mid = 2;
        const onCross = (x === mid && y === mid) || (y === mid && z === mid) || (x === mid && z === mid);
        if (onEdge === 3) push(cells, x, y, z, "gold");
        else if (onEdge === 2 || onCross) push(cells, x, y, z, "grey");
      }
  push(cells, 2, 2, 2, "gold");
  return { cells, width: n, depth: n, height: n };
}

/** 03 SECTORS / Fintech — a ledger: four stacked rows, alternating gold/grey, stepped like stairs. */
export function fintechLedger(): Shape {
  const cells: CubeCell[] = [];
  const len = 10;
  for (let r = 0; r < 4; r++) {
    const c = r % 2 === 0 ? "gold" : "grey";
    for (let x = 0; x < len; x++) for (let d = 0; d < 2; d++) push(cells, x, r, r + d, c);
  }
  return { cells, width: len, depth: 5, height: 4 };
}

/** 03 SECTORS / Frontier — a 2×2 gold tower tapering to 1×1, 14 high, with three cubes drifting above it. */
export function frontierTower(): Shape {
  const cells: CubeCell[] = [];
  for (let l = 0; l < 14; l++) {
    if (l < 10) for (let x = 0; x < 2; x++) for (let z = 0; z < 2; z++) push(cells, x, l, z);
    else push(cells, 0, l, 0);
  }
  const drift: CubeCell[] = [
    { x: 0, y: 15, z: 0, c: "gold" },
    { x: 1, y: 15, z: 1, c: GOLD_LIGHT },
    { x: 0, y: 15, z: 1, c: "gold" },
  ];
  return { cells, width: 2, depth: 2, height: 14, drift };
}

/** 04 APPROACH — three identical solid 3³ gold cubes in a row (discipline, repetition). */
export function approachTrio(): Shape {
  const cells: CubeCell[] = [];
  for (let k = 0; k < 3; k++)
    for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 3; z++) push(cells, k * 5 + x, y, z);
  return { cells, width: 13, depth: 3, height: 3 };
}

/** 05 NOTES — an open book: two stepped 6×8 grey pages rising outward, a gold spine down the middle. */
export function notesBook(): Shape {
  const cells: CubeCell[] = [];
  for (let z = 0; z < 8; z++) {
    for (let c = 0; c < 6; c++) {
      push(cells, c, Math.floor((5 - c) / 2), z, "grey"); // left page, outer edge higher
      push(cells, 7 + c, Math.floor(c / 2), z, "grey"); // right page
    }
    push(cells, 6, 0, z, "gold"); // spine
  }
  return { cells, width: 13, depth: 8, height: 3 };
}

/** 06 PARTNERS — three upright 4×4 hollow grey frames, each with a gold 2×2 inside. */
export function partnersFrames(): Shape {
  const cells: CubeCell[] = [];
  for (let k = 0; k < 3; k++) {
    const bx = k * 6;
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++) {
        const edge = x === 0 || x === 3 || y === 0 || y === 3;
        push(cells, bx + x, y, 0, edge ? "grey" : "gold");
      }
  }
  return { cells, width: 16, depth: 1, height: 4 };
}

/** 07 CONTACT — a 12×12 flat gold frame lying on the ground with the mark in the middle. */
export function contactSeal(): Shape {
  const cells: CubeCell[] = [];
  const n = 12;
  for (let x = 0; x < n; x++)
    for (let z = 0; z < n; z++) if (x === 0 || z === 0 || x === n - 1 || z === n - 1) push(cells, x, 0, z, "gold");
  for (const c of flatCells(markCells(), GOLD_LIGHT)) push(cells, c.x + 2, 0, c.z + 2, c.c);
  return { cells, width: n, depth: n, height: 1 };
}
