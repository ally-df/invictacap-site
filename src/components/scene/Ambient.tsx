"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { DynamicDrawUsage, InstancedMesh, Plane, Raycaster, Sphere, Vector2, Vector3 } from "three";
import { easeOutCubic, hash01 } from "@/lib/easing";
import { useSite } from "@/lib/store";
import { AXES, BOX_GEO, MAT_DIM, MAT_OPAQUE, cubeShade, tmpColor, tmpMatrix, type ColorSpec } from "./materials";
import {
  FLANK_INNER_X,
  FLANK_MIN_HALF_WIDTH,
  flankLimits,
  gateDistance,
  heroCenterZ,
  pxToWorld,
  useViewport,
  viewportHalfWidthUnits,
} from "./units";

const COUNT = 120;
const SEED = 77;
/** Cubes within this distance (units) of the pointer's ground point start rolling. */
const ROLL_RADIUS = 10;
const ROLL_RADIUS_SQ = ROLL_RADIUS * ROLL_RADIUS;
/** Duration of one quarter-turn roll, seconds. */
const ROLL_S = 0.4;
/** Rest between rolls, in frames (the reference's waitRolling: 10..100). */
const WAIT_MIN = 10;
const WAIT_MAX = 100;

const raycaster = new Raycaster();
const ndc = new Vector2();
const GROUND = new Plane(new Vector3(0, 1, 0), 0);
const hit = new Vector3();

type Data = {
  pos: Float32Array;
  colors: string[];
  sphere: Sphere;
  /** Initial rest frames per cube (so they don't all wake at once). */
  initialWait: Int16Array;
};

/** Mutable per-cube roll state, kept in a ref (mutated from useFrame only). */
type RollState = {
  rolling: Uint8Array;
  start: Float32Array;
  axis: Uint8Array;
  dir: Int8Array;
  wait: Int16Array;
};

function makeRollState(initialWait: Int16Array): RollState {
  return {
    rolling: new Uint8Array(COUNT),
    start: new Float32Array(COUNT),
    axis: new Uint8Array(COUNT),
    dir: new Int8Array(COUNT),
    wait: Int16Array.from(initialWait),
  };
}

function build(
  docHeightPx: number,
  innerWidth: number,
  innerHeight: number,
  compact: boolean,
  behind: boolean,
  columnCenterPx: number,
): Data {
  const halfW = viewportHalfWidthUnits(innerWidth, compact);
  const { left, right } = flankLimits(columnCenterPx, innerWidth, compact);
  const bandL = Math.max(0, -left - FLANK_INNER_X);
  const bandR = Math.max(0, right - FLANK_INNER_X);
  // Flanking cubes are outside the gate camera's 20° cone; cubes under the column must start
  // behind the gate camera so none loom into view before the intro.
  const z0 = heroCenterZ(innerHeight, compact) + (behind ? gateDistance() + 6 : 26);
  const z1 = Math.max(z0 + 100, pxToWorld(Math.max(docHeightPx, innerHeight * 8), compact) - 10);
  const pos = new Float32Array(COUNT * 3);
  const colors: string[] = [];
  const initialWait = new Int16Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const r = (k: number) => hash01(SEED * 7919 + i * 31 + k);
    let x: number;
    if (!behind && bandL + bandR > 8) {
      // Distribute proportionally to the room on each side of the column.
      const goRight = r(1) * (bandL + bandR) < bandR;
      x = goRight ? FLANK_INNER_X + r(2) * bandR : -(FLANK_INNER_X + r(2) * bandL);
    } else {
      x = (r(2) * 2 - 1) * Math.max(4, halfW - 2);
    }
    pos[i * 3] = Math.round(x) + 0.5;
    pos[i * 3 + 1] = 0.5;
    pos[i * 3 + 2] = Math.round(z0 + r(3) * (z1 - z0)) + 0.5;
    const spec: ColorSpec = behind ? "grey" : r(4) < 0.25 ? "gold" : "grey";
    colors.push(cubeShade(spec, SEED, i));
    initialWait[i] = Math.floor(r(5) * WAIT_MAX);
  }
  const sphere = new Sphere(new Vector3(0, 0.5, (z0 + z1) / 2), Math.hypot(halfW, (z1 - z0) / 2) + 4);
  return { pos, colors, sphere, initialWait };
}

/**
 * ~120 loose grey/gold cubes sprinkled beside the column down the whole page. In browse, cubes
 * near the pointer's projected ground point tumble a quarter turn, then rest for 10..100 frames.
 */
export default function Ambient({ docHeight, columnCenterPx }: { docHeight: number; columnCenterPx: number }) {
  const compact = useSite((s) => s.compact);
  const { innerWidth, innerHeight } = useViewport();
  const behind = compact || viewportHalfWidthUnits(innerWidth, compact) < FLANK_MIN_HALF_WIDTH;
  const data = useMemo(
    () => build(docHeight, innerWidth, innerHeight, compact, behind, columnCenterPx),
    [docHeight, innerWidth, innerHeight, compact, behind, columnCenterPx],
  );
  const ref = useRef<InstancedMesh>(null);
  const roll = useRef<RollState | null>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    roll.current = makeRollState(data.initialWait);
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    for (let i = 0; i < COUNT; i++) {
      tmpColor.set(data.colors[i]);
      mesh.setColorAt(i, tmpColor);
      tmpMatrix.identity();
      tmpMatrix.setPosition(data.pos[i * 3], data.pos[i * 3 + 1], data.pos[i * 3 + 2]);
      mesh.setMatrixAt(i, tmpMatrix);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.boundingSphere = data.sphere;
  }, [data]);

  // The mesh element is keyed on `behind`, so this cleanup runs exactly when that mesh goes away.
  useEffect(() => {
    const mesh = ref.current;
    return () => {
      mesh?.dispose();
    };
  }, [behind]);

  useFrame((state) => {
    const mesh = ref.current;
    const rs = roll.current;
    if (!mesh || !rs) return;
    const s = useSite.getState();
    const time = state.clock.elapsedTime;
    let hasHit = false;
    if (s.phase === "browse") {
      ndc.set(s.pointer.x, s.pointer.y);
      raycaster.setFromCamera(ndc, state.camera);
      hasHit = raycaster.ray.intersectPlane(GROUND, hit) !== null;
    }
    const { pos } = data;
    const { rolling, start, axis, dir, wait } = rs;
    let dirty = false;
    for (let i = 0; i < COUNT; i++) {
      const x = pos[i * 3];
      const y = pos[i * 3 + 1];
      const z = pos[i * 3 + 2];
      if (rolling[i]) {
        const k = (time - start[i]) / ROLL_S;
        if (k >= 1) {
          rolling[i] = 0;
          wait[i] = WAIT_MIN + Math.floor(Math.random() * (WAIT_MAX - WAIT_MIN));
          tmpMatrix.identity();
        } else {
          tmpMatrix.makeRotationAxis(AXES[axis[i]], dir[i] * easeOutCubic(k) * (Math.PI / 2));
        }
        tmpMatrix.setPosition(x, y, z);
        mesh.setMatrixAt(i, tmpMatrix);
        dirty = true;
      } else if (wait[i] > 0) {
        wait[i]--;
      } else if (hasHit) {
        const dx = hit.x - x;
        const dz = hit.z - z;
        if (dx * dx + dz * dz < ROLL_RADIUS_SQ) {
          rolling[i] = 1;
          start[i] = time;
          axis[i] = Math.random() < 0.5 ? 0 : 2;
          dir[i] = Math.random() < 0.5 ? -1 : 1;
        }
      }
    }
    if (dirty) mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      key={behind ? "dim" : "lit"}
      ref={ref}
      args={[BOX_GEO, behind ? MAT_DIM : MAT_OPAQUE, COUNT]}
      frustumCulled
      dispose={null}
    />
  );
}
