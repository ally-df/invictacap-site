"use client";

import { useState } from "react";
import { brand } from "@/content/site";
import { INTRO_MS, useSite } from "@/lib/store";
import { blip, hoverSound, unlockAudio } from "@/lib/audio";
import { MarkSvg } from "./MarkSvg";
import { PixelText } from "./PixelText";

/**
 * The landing block. Fixed over the scene (z-20, under the nav); fades once the
 * intro starts and unmounts when browsing begins.
 */
export function EnterGate() {
  const phase = useSite((s) => s.phase);
  const lite = useSite((s) => s.lite);
  const sceneReady = useSite((s) => s.sceneReady);
  const enter = useSite((s) => s.enter);
  const [hovering, setHovering] = useState(false);

  if (phase === "browse") return null;
  const leaving = phase === "intro";
  // The 3D mark takes over during the intro; the DOM mark only stays in lite.
  const hideMark = !lite && leaving;

  const onEnter = () => {
    if (useSite.getState().phase !== "gate") return;
    unlockAudio();
    blip("enter");
    enter();
    window.setTimeout(() => useSite.getState().finishIntro(), lite ? 600 : INTRO_MS);
  };

  return (
    <div
      className={["gate fixed inset-0 z-20 flex items-center justify-center", lite ? "grid-bg bg-bg" : "", leaving ? "leaving" : ""].join(" ")}
      aria-hidden={leaving}
    >
      <div className="flex flex-col items-center text-center" style={{ gap: "calc(var(--unit) * 4)", padding: "calc(var(--unit) * 4)" }}>
        {lite ? (
          <button type="button" aria-label={brand.enterLabel} onClick={onEnter} className="hov text-gold w-12 h-12 md:w-16 md:h-16" {...hoverSound()}>
            <MarkSvg size="100%" />
          </button>
        ) : (
          /* The 3D mark stands here (33vh tall, see scene/CameraRig); this is its click target. */
          <button
            type="button"
            aria-label={brand.enterLabel}
            onClick={onEnter}
            className="hov flex items-center justify-center text-gold"
            style={{ height: "33vh", width: "33vh", visibility: hideMark ? "hidden" : "visible", background: "transparent" }}
            {...hoverSound()}
          >
            {/* Fallback mark until the WebGL mark has drawn its first frame (same size: 30vh). */}
            {!sceneReady && (
              <span className="block" style={{ width: "30vh", height: "30vh" }}>
                <MarkSvg size="100%" />
              </span>
            )}
          </button>
        )}

        <PixelText as="div" lines={[brand.wordmark]} cell={4} align="center" className={["text-gold", hovering ? "gold-cycle-fg" : ""].join(" ")} />

        <p className="label" style={{ color: "var(--text-2)" }}>
          {brand.tagline}
        </p>

        <button
          type="button"
          className="btn hov hidden md:inline-block"
          style={{ marginTop: "calc(var(--unit) * 4)" }}
          onClick={onEnter}
          onMouseEnter={() => {
            setHovering(true);
            blip("hover");
          }}
          onMouseLeave={() => setHovering(false)}
          onFocus={() => setHovering(true)}
          onBlur={() => setHovering(false)}
        >
          {brand.enterLabel}
        </button>

        <p className="font-body" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: "calc(var(--unit) * 2)" }}>
          {brand.soundNotice}
        </p>
      </div>
    </div>
  );
}
