"use client";

import { brand } from "@/content/site";
import { useSite } from "@/lib/store";
import { MarkSvg } from "./MarkSvg";
import { PixelText } from "./PixelText";

/**
 * The first viewport. In the default view the 3D mark lands here, so this is
 * an empty spacer; in Lite it shows the static mark + wordmark instead.
 */
export function TopBlock() {
  const lite = useSite((s) => s.lite);
  const phase = useSite((s) => s.phase);
  const showStatic = lite && phase === "browse";

  return (
    <div id="top" aria-hidden="true" style={{ height: "100vh" }} className="relative flex items-center justify-center">
      {showStatic && (
        <div className="flex flex-col items-center text-center" style={{ gap: "calc(var(--unit) * 4)" }}>
          <span className="text-gold block w-16 h-16 md:w-24 md:h-24">
            <MarkSvg size="100%" />
          </span>
          <PixelText as="div" lines={[brand.wordmark]} cell={4} align="center" className="text-gold" />
          <p className="label" style={{ color: "var(--text-2)" }}>
            {brand.tagline}
          </p>
        </div>
      )}
    </div>
  );
}
