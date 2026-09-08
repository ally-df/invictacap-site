"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Fog, PerspectiveCamera, Vector3 } from "three";
import { clamp, damp, easeCamera, lerp } from "@/lib/easing";
import { INTRO_MS, useSite } from "@/lib/store";
import {
  BROWSE_FOV,
  FOG_FAR_K,
  FOG_NEAR_K,
  GATE_EYE_Y,
  GATE_FOV,
  PARALLAX_X,
  PARALLAX_Y,
  TILT,
  browseDistance,
  columnShiftX,
  gateDistance,
  gateLiftUnits,
  heroCenterZ,
  sceneLayout,
  viewCenterZ,
} from "./units";

// Scratch vectors (module-level; never allocate in useFrame).
const gateEye = new Vector3();
const gateTarget = new Vector3();
const browseEye = new Vector3();
const browseTarget = new Vector3();

const LAMBDA = 6; // ≈ the reference's 0.1/frame at 60fps

/**
 * Owns the default camera. See units.ts for the world/camera convention.
 *  gate   → level, close, straight at the standing mark.
 *  intro  → gate pose ⇒ browse pose over INTRO_MS with easeCamera (fov 20 → 45, tilt 0 → 45°).
 *  browse → follows the ground under the viewport centre with exponential damping + pointer parallax.
 */
export default function CameraRig() {
  const cur = useRef({
    eye: new Vector3(0, GATE_EYE_Y, 200),
    target: new Vector3(0, GATE_EYE_Y, 0),
    fov: GATE_FOV,
    px: 0,
    py: 0,
    initialised: false,
  });

  useFrame((state, dtRaw) => {
    const { camera, scene } = state;
    if (!(camera instanceof PerspectiveCamera)) return;
    const dt = Math.min(dtRaw, 1 / 20);
    const s = useSite.getState();
    const compact = s.compact;
    const vh = window.innerHeight;
    const c = cur.current;

    // World x = 0 is the DOM column's centre; in browse the camera shifts so it lands there on
    // screen. The DOM gate is centred on the viewport instead, so the gate pose stays at x = 0 and
    // the shift lerps in with the intro.
    const sx = columnShiftX(sceneLayout.columnCenterPx, window.innerWidth, compact);

    // Gate pose: level, looking along -Z at the mark standing on the hero centre, with the look-at
    // lowered so the mark sits GATE_LIFT_PX above the viewport centre (the DOM's mark slot).
    const zc0 = heroCenterZ(vh, compact);
    const gy = GATE_EYE_Y - gateLiftUnits(vh);
    gateTarget.set(0, gy, zc0);
    gateEye.set(0, gy, zc0 + gateDistance());

    // Browse pose for the current scroll.
    const L = browseDistance(vh, compact);
    const H = L * Math.sin(TILT);
    const D = L * Math.cos(TILT);

    if (s.phase === "gate") {
      c.eye.copy(gateEye);
      c.target.copy(gateTarget);
      c.fov = GATE_FOV;
      c.px = 0;
      c.py = 0;
    } else if (s.phase === "intro") {
      const now = performance.now();
      const t = clamp((now - s.introStartedAt) / INTRO_MS);
      const e = easeCamera(t);
      browseTarget.set(sx, 0, zc0);
      browseEye.set(sx, H, zc0 + D);
      c.eye.lerpVectors(gateEye, browseEye, e);
      c.target.lerpVectors(gateTarget, browseTarget, e);
      c.fov = lerp(GATE_FOV, BROWSE_FOV, e);
      if (t >= 1) s.finishIntro();
    } else {
      const zc = viewCenterZ(s.scrollY, vh, compact);
      browseTarget.set(sx, 0, zc);
      c.px = damp(c.px, s.pointer.x * PARALLAX_X, LAMBDA, dt);
      c.py = damp(c.py, s.pointer.y * PARALLAX_Y, LAMBDA, dt);
      browseEye.set(sx + c.px, H + c.py, zc + D);
      c.eye.x = damp(c.eye.x, browseEye.x, LAMBDA, dt);
      c.eye.y = damp(c.eye.y, browseEye.y, LAMBDA, dt);
      c.eye.z = damp(c.eye.z, browseEye.z, LAMBDA, dt);
      c.target.x = damp(c.target.x, browseTarget.x, LAMBDA, dt);
      c.target.y = damp(c.target.y, browseTarget.y, LAMBDA, dt);
      c.target.z = damp(c.target.z, browseTarget.z, LAMBDA, dt);
      c.fov = damp(c.fov, BROWSE_FOV, LAMBDA, dt);
    }

    camera.position.copy(c.eye);
    camera.lookAt(c.target);
    if (Math.abs(camera.fov - c.fov) > 1e-3 || !c.initialised) {
      camera.fov = c.fov;
      camera.updateProjectionMatrix();
      c.initialised = true;
    }

    // Fog scales with the browse distance so the far ground fades whatever the viewport size.
    const fog = scene.fog;
    if (fog instanceof Fog) {
      fog.near = L * FOG_NEAR_K;
      fog.far = L * FOG_FAR_K;
    }
  });

  return null;
}
