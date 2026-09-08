"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { DynamicDrawUsage, InstancedMesh, Sphere, Vector3 } from "three";
import { clamp, damp, easeOutCubic, hash01, lerp } from "@/lib/easing";
import { BOX_GEO, MAT_DIM, MAT_OPAQUE, cubeShade, tmpColor, tmpMatrix, type ColorSpec } from "./materials";

/** A cell in shape space: integer offsets, y up. `c` overrides the mesh-level colour. */
export type CubeCell = { x: number; y: number; z: number; c?: ColorSpec };
export type Assemble = "rise" | "scatter" | "none";
/** Per-frame vertical offset (world units) for a cube — used for bobbing / drifting. */
export type IdleFn = (i: number, t: number, cell: CubeCell) => number;

export type CubesProps = {
  cells: readonly CubeCell[];
  /** World position of shape cell (0,0,0)'s min corner. A cell (x,y,z) occupies [x, x+size) per axis. */
  origin?: readonly [number, number, number];
  /** Cube edge length in world units. */
  size?: number;
  /** Mesh-level palette; `cell.c` wins per cube. */
  color?: ColorSpec;
  seed?: number;
  /** Assembly progress 0..1; a function is evaluated every frame (read the store inside it). */
  progress?: number | (() => number);
  assemble?: Assemble;
  /** `bob` = gentle sine bob; a function returns a per-cube y offset. */
  idle?: "none" | "bob" | IdleFn;
  /** Transparent low-contrast material (pieces sitting behind the text column). */
  dim?: boolean;
  /** Extra bounding-sphere margin for custom idle functions that travel far. */
  idleRange?: number;
};

type Data = {
  target: Float32Array;
  start: Float32Array;
  jitter: Float32Array;
  phase: Float32Array;
  sphere: Sphere;
};

const BOB_SPEED = 1.5;
const BOB_AMP = 0.05;
const PROGRESS_LAMBDA = 10;

function buildData(
  cells: readonly CubeCell[],
  ox: number,
  oy: number,
  oz: number,
  size: number,
  seed: number,
  assemble: Assemble,
  margin: number,
): Data {
  const n = cells.length;
  const target = new Float32Array(n * 3);
  const start = new Float32Array(n * 3);
  const jitter = new Float32Array(n);
  const phase = new Float32Array(n);
  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity,
    maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;
  const grow = (x: number, y: number, z: number) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  };

  for (let i = 0; i < n; i++) {
    const c = cells[i];
    const tx = ox + (c.x + 0.5) * size;
    const ty = oy + (c.y + 0.5) * size;
    const tz = oz + (c.z + 0.5) * size;
    const r1 = hash01(seed * 7919 + i * 31 + 1);
    const r2 = hash01(seed * 7919 + i * 31 + 2);
    const r3 = hash01(seed * 7919 + i * 31 + 3);
    const r4 = hash01(seed * 7919 + i * 31 + 4);
    const r5 = hash01(seed * 7919 + i * 31 + 5);

    let sx = tx,
      sy = ty,
      sz = tz;
    if (assemble === "rise") {
      sy = ty + 8 + 12 * r1;
    } else if (assemble === "scatter") {
      const theta = r1 * Math.PI * 2;
      const u = r2 * 2 - 1;
      const k = Math.sqrt(1 - u * u);
      const dist = 10 + 30 * r3;
      sx = tx + Math.cos(theta) * k * dist;
      sy = Math.max(0.5, ty + u * dist);
      sz = tz + Math.sin(theta) * k * dist;
    }
    target[i * 3] = tx;
    target[i * 3 + 1] = ty;
    target[i * 3 + 2] = tz;
    start[i * 3] = sx;
    start[i * 3 + 1] = sy;
    start[i * 3 + 2] = sz;
    jitter[i] = r4;
    phase[i] = r5 * Math.PI * 2;
    grow(tx, ty, tz);
    grow(sx, sy, sz);
  }

  if (n === 0) {
    minX = minY = minZ = 0;
    maxX = maxY = maxZ = 0;
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  const radius = Math.hypot(maxX - minX, maxY - minY, maxZ - minZ) / 2 + size + margin;
  return { target, start, jitter, phase, sphere: new Sphere(new Vector3(cx, cy, cz), radius) };
}

function writeMatrices(
  mesh: InstancedMesh,
  data: Data,
  cells: readonly CubeCell[],
  size: number,
  assemble: Assemble,
  idle: CubesProps["idle"],
  p: number,
  t: number,
) {
  const { target, start, jitter, phase } = data;
  const n = cells.length;
  for (let i = 0; i < n; i++) {
    const local = assemble === "none" ? 1 : clamp(p * 1.4 - jitter[i] * 0.4);
    const e = easeOutCubic(local);
    const x = lerp(start[i * 3], target[i * 3], e);
    const y = lerp(start[i * 3 + 1], target[i * 3 + 1], e);
    const z = lerp(start[i * 3 + 2], target[i * 3 + 2], e);
    let dy = 0;
    if (idle === "bob") dy = Math.sin(t * BOB_SPEED + phase[i]) * BOB_AMP * e;
    else if (typeof idle === "function") dy = idle(i, t, cells[i]);
    const s = local > 0 ? size : 0;
    tmpMatrix.makeScale(s, s, s);
    tmpMatrix.setPosition(x, y + dy, z);
    mesh.setMatrixAt(i, tmpMatrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

/**
 * Generic instanced voxel group. One draw call per <Cubes>. Matrices are rewritten only while the
 * (damped) assembly progress is changing or an idle animation is active.
 */
export default function Cubes({
  cells,
  origin = [0, 0, 0],
  size = 1,
  color = "gold",
  seed = 1,
  progress = 1,
  assemble = "rise",
  idle = "none",
  dim = false,
  idleRange,
}: CubesProps) {
  const ref = useRef<InstancedMesh>(null);
  const count = cells.length;
  const [ox, oy, oz] = origin;
  const margin = idleRange ?? (typeof idle === "function" ? 16 : BOB_AMP * 2);

  const data = useMemo(
    () => buildData(cells, ox, oy, oz, size, seed, assemble, margin),
    [cells, ox, oy, oz, size, seed, assemble, margin],
  );

  const anim = useRef({ target: -1, smooth: 0 });

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    for (let i = 0; i < count; i++) {
      // Dim pieces sit under the text: keep them monochrome, ignore per-cell gold accents.
      tmpColor.set(cubeShade(dim ? color : (cells[i].c ?? color), seed, i));
      mesh.setColorAt(i, tmpColor);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.boundingSphere = data.sphere;
    // Force a re-write on the next frame (progress may be unchanged but the layout is new).
    anim.current.target = -1;
  }, [cells, color, count, data, dim, seed]);

  // The mesh element is keyed on `count`, so this cleanup runs exactly when that mesh goes away.
  useEffect(() => {
    const mesh = ref.current;
    return () => {
      mesh?.dispose();
    };
  }, [count]);

  useFrame((state, dtRaw) => {
    const mesh = ref.current;
    if (!mesh) return;
    const a = anim.current;
    const want = typeof progress === "function" ? progress() : progress;
    const first = a.target < 0;
    let smooth = a.smooth;
    if (first) smooth = want;
    else if (Math.abs(want - smooth) < 1e-4) smooth = want;
    else smooth = damp(smooth, want, PROGRESS_LAMBDA, Math.min(dtRaw, 0.1));
    const changed = first || smooth !== a.smooth;
    a.target = want;
    a.smooth = smooth;
    const idling = idle !== "none" && smooth > 0;
    if (!changed && !idling) return;
    writeMatrices(mesh, data, cells, size, assemble, idle, smooth, state.clock.elapsedTime);
  });

  if (count === 0) return null;
  return (
    <instancedMesh
      key={count}
      ref={ref}
      args={[BOX_GEO, dim ? MAT_DIM : MAT_OPAQUE, count]}
      frustumCulled
      dispose={null}
    />
  );
}

/* ───────── Helpers for 2D bitmaps (layoutText / markCells) ───────── */

/** Lay a 2D bitmap flat on the ground: bitmap y (down) → world +z (down the page). */
export function flatCells(cells: readonly { x: number; y: number }[], c?: ColorSpec): CubeCell[] {
  return cells.map((p) => ({ x: p.x, y: 0, z: p.y, c }));
}

/** Stand a 2D bitmap upright facing +Z (the camera): bitmap y (down) → world y (up), 1 deep. */
export function uprightCells(cells: readonly { x: number; y: number }[], height: number, c?: ColorSpec): CubeCell[] {
  return cells.map((p) => ({ x: p.x, y: height - 1 - p.y, z: 0, c }));
}
