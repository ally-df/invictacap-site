import type { CSSProperties } from "react";

type Corner = "tl" | "tr" | "bl" | "br";

const POS: Record<Corner, CSSProperties> = {
  tl: { top: 0, left: 0 },
  tr: { top: 0, right: 0 },
  bl: { bottom: 0, left: 0 },
  br: { bottom: 0, right: 0 },
};

type Props = {
  /** Space-separated corners, e.g. "tl br". */
  corners?: string;
  double?: boolean;
  muted?: boolean;
};

/** 4px registration marks. Place inside a `position: relative` block. */
export function Dots({ corners = "tl br", double = false, muted = false }: Props) {
  const list = corners.split(/\s+/).filter((c): c is Corner => c in POS);
  const cls = ["dot", double && "double", muted && "muted"].filter(Boolean).join(" ");
  return (
    <>
      {list.map((c) => (
        <span key={c} aria-hidden="true" className={cls} style={{ position: "absolute", ...POS[c] }} />
      ))}
    </>
  );
}
