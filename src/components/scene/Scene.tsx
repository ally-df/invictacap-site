"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSite } from "@/lib/store";
import Ambient from "./Ambient";
import CameraRig from "./CameraRig";
import Floor from "./Floor";
import LogoMark from "./LogoMark";
import { BG } from "./materials";
import SetPieces from "./SetPieces";
import { GATE_EYE_Y, GATE_FOV, useAnchors } from "./units";

const subscribeNoop = () => () => undefined;

/** Flags `sceneReady` on the first frame the GL loop runs (i.e. the standing mark is drawn). */
function ReadySignal() {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    useSite.getState().setSceneReady(true);
  });
  return null;
}

/**
 * Fixed full-viewport WebGL layer behind the DOM (`.scene-canvas`; hidden by CSS in Lite mode and
 * unmounted here). Flat-shaded gold voxels on near-black — see units.ts for the world convention.
 */
export default function Scene() {
  const lite = useSite((s) => s.lite);
  const liteResolved = useSite((s) => s.liteResolved);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  const { anchors, docHeight, columnCenterPx } = useAnchors();

  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Not ready once the scene is gone (Lite toggled on).
  useEffect(() => () => useSite.getState().setSceneReady(false), []);

  // Wait for the URL / reduced-motion / WebGL decision before creating a GL context.
  if (lite || !liteResolved || !mounted) return null;

  return (
    <div
      className="scene-canvas"
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      <Canvas
        dpr={[1, 2]}
        flat
        frameloop={frameloop}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
        camera={{ fov: GATE_FOV, near: 1, far: 1500, position: [0, GATE_EYE_Y, 200] }}
        style={{ pointerEvents: "none" }}
      >
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 140, 320]} />
        {/* Key from above / slightly in front: top faces ≈ base colour, fronts ~0.8×, sides ~0.55×. */}
        <ambientLight intensity={1.6} />
        <directionalLight position={[-1, 8, 5]} intensity={1.7} />
        <CameraRig />
        <ReadySignal />
        <Floor docHeight={docHeight} />
        <LogoMark />
        <SetPieces anchors={anchors} columnCenterPx={columnCenterPx} />
        <Ambient docHeight={docHeight} columnCenterPx={columnCenterPx} />
      </Canvas>
    </div>
  );
}
