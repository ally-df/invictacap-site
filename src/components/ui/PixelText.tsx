import type { CSSProperties } from "react";
import { layoutText } from "@/lib/pixelFont";

type Tag = "div" | "span" | "h1" | "h2" | "h3" | "p";

export type PixelTextProps = {
  lines: readonly string[];
  /**
   * Cell size in desktop px (8 = one grid unit). Scales with `--unit`, so it
   * halves on compact layouts automatically. Pass `fixed` to keep it in px.
   */
  cell?: number;
  align?: "left" | "center" | "right";
  /** CSS color; defaults to the parent's `currentColor`. */
  color?: string;
  as?: Tag;
  fixed?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Bitmap headline rendered as an SVG of crisp squares (no hooks; server-safe).
 * The real text stays in the DOM (visually hidden) for SEO / assistive tech.
 */
export function PixelText({
  lines,
  cell = 8,
  align = "left",
  color = "currentColor",
  as: Tag = "div",
  fixed = false,
  className,
  style,
}: PixelTextProps) {
  const { cells, width, height } = layoutText(lines, align);
  const maxWidth = fixed ? `${width * cell}px` : `calc(${(width * cell) / 8} * var(--unit))`;
  const marginInline = align === "center" ? "auto" : align === "right" ? "auto 0 auto auto" : undefined;

  return (
    <Tag className={["pixel-text", className].filter(Boolean).join(" ")} style={style}>
      <span className="hideText">{lines.join(" ")}</span>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMinYMin meet"
        shapeRendering="crispEdges"
        fill="currentColor"
        style={{ display: "block", width: "100%", maxWidth, height: "auto", color, marginInline }}
      >
        {cells.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} />
        ))}
      </svg>
    </Tag>
  );
}
