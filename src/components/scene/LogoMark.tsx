"use client";

import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { DynamicDrawUsage, InstancedMesh, Sphere, Vector3 } from "three";
import { clamp, easeInOutCubic, hash01, lerp } from "@/lib/easing";
import { layoutText } from "@/lib/pixelFont";
import { INTRO_MS, useSite } from "@/lib/store";
import { MARK_SIZE, markCells } from "@/lib/voxelMark";
import Cubes, { flatCells } from "./Cubes";
import { AXES, BOX_GEO, MAT_OPAQUE, cubeShade, tmpColor, tmpMatrix, tmpVec } from "./materials";
import { heroCenterZ, useViewport } from "./units";

/** The browse hero mark stands at twice the unit size (16 units tall). */
const HERO_SCALE = 2;
/** Gap (units) between the standing mark's front face and the wordmark lying in front of it. */
const WORDMARK_GAP = 3;
const BOB_SPEED = 1.2;
const BOB_AMP = 0.04;
const SEED = 11;

type MarkData = {
  a: Float32Array; // standing pose, 1x (gate)
  b: Float32Array; // standing pose, 2x (browse)
  dir: Float32Array; // scatter direction (unit)
  amp: Float32Array; // scatter distance
  axis: Uint8Array; // spin axis index into AXES
  spins: Float32Array; // quarter turns during the intro
  phase: Float32Array;
  sphere: Sphere;
};

function buildMark(zc0: number): MarkData {
  const cells = markCells();
  const n = cells.length;
  const a = new Float32Array(n * 3);
  const b = new Float32Array(n * 3);
  const dir = new Float32Array(n * 3);
  const amp = new Float32Array(n);
  const axis = new Uint8Array(n);
  const spins = new Float32Array(n);
  const phase = new Float32Array(n);
  const half = MARK_SIZE / 2;
  for (let i = 0; i < n; i++) {
    const { x, y } = cells[i];
    const r = (k: number) => hash01(SEED * 7919 + i * 31 + k);
    // Standing upright in the XY plane at z = zc0, feet on the ground, facing +Z (the gate camera).
    a[i * 3] = x - half + 0.5;
    a[i * 3 + 1] = MARK_SIZE - 1 - y + 0.5;
    a[i * 3 + 2] = zc0;
    // Standing on the ground at the hero centre at 2x, still facing the (now tilted) camera.
    b[i * 3] = (x - half + 0.5) * HERO_SCALE;
    b[i * 3 + 1] = (MARK_SIZE - 1 - y + 0.5) * HERO_SCALE;
    b[i * 3 + 2] = zc0;
    // Scatter outward from the mark's centre with an upward bias and some noise.
    let dx = x - (half - 0.5) + (r(1) - 0.5) * 2.5;
    let dy = half - 0.5 - y + (r(2) - 0.5) * 2.5 + 2;
    let dz = (r(3) - 0.5) * 3;
    const len = Math.hypot(dx, dy, dz) || 1;
    dx /= len;
    dy /= len;
    dz /= len;
    dir[i * 3] = dx;
    dir[i * 3 + 1] = dy;
    dir[i * 3 + 2] = dz;
    amp[i] = 6 + r(4) * 14;
    axis[i] = Math.floor(r(5) * 3) % 3;
    spins[i] = 1 + Math.floor(r(6) * 3);
    phase[i] = r(7) * Math.PI * 2;
  }
  return {
    a,
    b,
    dir,
    amp,
    axis,
    spins,
    phase,
    sphere: new Sphere(new Vector3(0, half * HERO_SCALE, zc0), MARK_SIZE * HERO_SCALE + 24),
  };
}

/** Write the current pose into the mesh. `t` 0 = gate (1x), 1 = browse (2x); scatter peaks mid-way. */
function writeMark(mesh: InstancedMesh, data: MarkData, t: number, time: number, bob: boolean) {
  const e = easeInOutCubic(t);
  const sc = Math.sin(Math.PI * t);
  const size = lerp(1, HERO_SCALE, e);
  const { a, b, dir, amp, axis, spins, phase } = data;
  const n = amp.length;
  for (let i = 0; i < n; i++) {
    const x = lerp(a[i * 3], b[i * 3], e) + dir[i * 3] * amp[i] * sc;
    const y = lerp(a[i * 3 + 1], b[i * 3 + 1], e) + dir[i * 3 + 1] * amp[i] * sc;
    const z = lerp(a[i * 3 + 2], b[i * 3 + 2], e) + dir[i * 3 + 2] * amp[i] * sc;
    const dy = bob ? Math.sin(time * BOB_SPEED + phase[i]) * BOB_AMP : 0;
    tmpMatrix.makeRotationAxis(AXES[axis[i]], e * spins[i] * (Math.PI / 2));
    tmpMatrix.scale(tmpVec.set(size, size, size));
    tmpMatrix.setPosition(x, y + dy, z);
    mesh.setMatrixAt(i, tmpMatrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

/**
 * The hero mark. Gate: standing upright at 1x, straight at the level camera. Intro: the 52 cubes
 * scatter outward, spin, and settle back as the same mark standing at 2x while the camera pulls
 * back and tilts; the wordmark rises into place on the ground in front of it during the last 40%.
 */
export default function LogoMark() {
  const compact = useSite((s) => s.compact);
  const { innerHeight } = useViewport();
  const zc0 = heroCenterZ(innerHeight, compact);

  const ref = useRef<InstancedMesh>(null);
  const data = useMemo(() => buildMark(zc0), [zc0]);
  const count = data.amp.length;
  const st = useRef({ written: false, lastT: -1 });

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    for (let i = 0; i < count; i++) {
      tmpColor.set(cubeShade("gold", SEED, i));
      mesh.setColorAt(i, tmpColor);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.boundingSphere = data.sphere;
    // Write the gate pose synchronously so the very first frame already shows the standing mark.
    writeMark(mesh, data, 0, 0, false);
    st.current.written = false;
  }, [count, data]);

  useEffect(() => {
    const mesh = ref.current;
    return () => {
      mesh?.dispose();
    };
  }, []);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const s = useSite.getState();
    let t = 0;
    if (s.phase === "intro") t = clamp((performance.now() - s.introStartedAt) / INTRO_MS);
    else if (s.phase === "browse") t = 1;
    const bob = s.phase === "browse";
    const k = st.current;
    if (!bob && k.written && k.lastT === t) return;
    writeMark(mesh, data, t, state.clock.elapsedTime, bob);
    k.written = true;
    k.lastT = t;
  });

  const wordmark = useMemo(() => {
    const t = layoutText(["INVICTA CAPITAL"], "center");
    return { cells: flatCells(t.cells), width: t.width, height: t.height };
  }, []);

  /** 0 until 60% of the intro, then ramps to 1 by its end; 1 in browse. */
  const lateIntro = useCallback(() => {
    const s = useSite.getState();
    if (s.phase === "gate") return 0;
    if (s.phase === "browse") return 1;
    return clamp(((performance.now() - s.introStartedAt) / INTRO_MS - 0.6) / 0.4);
  }, []);

  return (
    <>
      <instancedMesh ref={ref} args={[BOX_GEO, MAT_OPAQUE, count]} frustumCulled dispose={null} />
      <Cubes
        cells={wordmark.cells}
        origin={[-wordmark.width / 2, 0, zc0 + HERO_SCALE / 2 + WORDMARK_GAP]}
        color="gold"
        seed={3}
        progress={lateIntro}
        assemble="rise"
        idle="bob"
      />
    </>
  );
}
