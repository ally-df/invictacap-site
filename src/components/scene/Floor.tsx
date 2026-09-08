"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { BufferGeometry, Color, Float32BufferAttribute, Plane, ShaderMaterial, Vector3 } from "three";
import { clamp, damp } from "@/lib/easing";
import { INTRO_MS, useSite } from "@/lib/store";
import { GREY } from "./materials";
import { GRID_CELL_UNITS, browseDistance, pxToWorld } from "./units";

/** Peak dot opacity at the look-at point. */
const FLOOR_OPACITY = 0.22;
/** Total dot-field width in world units (either side of the column). */
const FLOOR_WIDTH = 320;
/** Units of dots before document px 0 and after the end of the page. */
const OVERSCAN = 80;
/** Dot size in CSS px (scaled by the pixel ratio in the shader uniform). */
const DOT_PX = 2;
/** Dots fade to nothing at this multiple of the browse distance from the look-at point. */
const FADE_RADIUS_K = 0.8;
const FLOOR_Y = -0.05;

const GROUND = new Plane(new Vector3(0, 1, 0), 0);
const forward = new Vector3();
const lookAt = new Vector3();

const material = new ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uCenter: { value: new Vector3() },
    uRadius: { value: 100 },
    uOpacity: { value: 0 },
    uSize: { value: DOT_PX },
    uColor: { value: new Color(GREY) },
  },
  vertexShader: /* glsl */ `
    uniform vec3 uCenter;
    uniform float uRadius;
    uniform float uSize;
    varying float vAlpha;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      float d = distance(position.xz, uCenter.xz);
      vAlpha = 1.0 - smoothstep(uRadius * 0.3, uRadius, d);
      gl_PointSize = uSize;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vAlpha;
    void main() {
      float a = uOpacity * vAlpha;
      if (a < 0.003) discard;
      gl_FragColor = vec4(uColor, a);
      #include <colorspace_fragment>
    }
  `,
});

function buildDots(docHeightPx: number, compact: boolean) {
  const cell = GRID_CELL_UNITS;
  const halfW = FLOOR_WIDTH / 2;
  const z0 = -OVERSCAN;
  const z1 = pxToWorld(Math.max(docHeightPx, 4000), compact) + OVERSCAN;
  const nx = Math.floor((halfW * 2) / cell) + 1;
  const nz = Math.floor((z1 - z0) / cell) + 1;
  const arr = new Float32Array(nx * nz * 3);
  let k = 0;
  for (let iz = 0; iz < nz; iz++) {
    const z = z0 + iz * cell;
    for (let ix = 0; ix < nx; ix++) {
      arr[k++] = -halfW + ix * cell;
      arr[k++] = 0;
      arr[k++] = z;
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(arr, 3));
  return geo;
}

/**
 * A field of tiny square dots at the intersections of a 4-unit (32px desktop) grid on the ground,
 * spanning the whole page. Only the area around the camera's look-at point is visible (radial
 * alpha falloff). Hidden in the gate, fades in over the first half of the intro.
 */
export default function Floor({ docHeight }: { docHeight: number }) {
  const compact = useSite((s) => s.compact);
  const geometry = useMemo(() => buildDots(docHeight, compact), [docHeight, compact]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, dt) => {
    const s = useSite.getState();
    let target = FLOOR_OPACITY;
    if (s.phase === "gate") target = 0;
    else if (s.phase === "intro") target = clamp(((performance.now() - s.introStartedAt) / INTRO_MS) * 2) * FLOOR_OPACITY;
    const u = material.uniforms;
    u.uOpacity.value = s.phase === "browse" ? damp(u.uOpacity.value as number, target, 6, Math.min(dt, 0.1)) : target;
    u.uSize.value = DOT_PX * state.gl.getPixelRatio();
    u.uRadius.value = browseDistance(window.innerHeight, s.compact) * FADE_RADIUS_K;
    // Centre the falloff on where the camera's forward ray meets the ground.
    state.camera.getWorldDirection(forward);
    const denom = forward.y;
    if (Math.abs(denom) > 1e-4) {
      const t = -state.camera.position.y / denom;
      if (t > 0) (u.uCenter.value as Vector3).copy(state.camera.position).addScaledVector(forward, t);
    } else if (GROUND.projectPoint(state.camera.position, lookAt)) {
      (u.uCenter.value as Vector3).copy(lookAt);
    }
  });

  return <points geometry={geometry} material={material} position={[0, FLOOR_Y, 0]} frustumCulled={false} />;
}
