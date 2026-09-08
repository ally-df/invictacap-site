import type { CSSProperties } from "react";
import { MARK_SIZE, markCells } from "@/lib/voxelMark";

type Props = {
  /** Rendered size (px number or any CSS length). */
  size?: number | string;
  /** When given, the mark is announced as an image with this label. */
  title?: string;
  className?: string;
  style?: CSSProperties;
};

/** The Invicta voxel mark as an inline SVG in `currentColor` (no hooks; server-safe). */
export function MarkSvg({ size = 64, title, className, style }: Props) {
  return (
    <svg
      viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}
      shapeRendering="crispEdges"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      style={{ display: "block", width: size, height: size, ...style }}
    >
      {markCells().map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} />
      ))}
    </svg>
  );
}
