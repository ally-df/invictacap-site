import type { JSX, ReactNode } from "react";
import type { EssayBlock } from "@/content/essay";

type Kind = Extract<EssayBlock, { type: "figure" }>["figure"];

const GOLD = "var(--gold)";
const GREY = "var(--grey-cube)";
const GREY_2 = "var(--grey-cube-2)";

/** One SVG user unit = one 8px grid cell; the frame is 48 x 16 cells. */
const W = 48;
const H = 16;

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      {children}
    </svg>
  );
}

/** FIG.01 — four descending square bars (castle → gunpowder → carrier → drone). */
function Repricing() {
  const heights = [12, 8, 4, 1];
  return (
    <Frame label="Four descending bars: the cost of the decisive weapon falls to consumer-electronics scale.">
      {heights.map((h, i) => (
        <rect key={h} x={6 + i * 10} y={H - 2 - h} width={4} height={h} fill={i === heights.length - 1 ? GOLD : GREY} />
      ))}
      <rect x={0} y={H - 2} width={W} height={1} fill={GREY_2} />
    </Frame>
  );
}

/** FIG.02 — attacker cost (small gold) against defender cost (large grey), three rows. */
function Ledger() {
  const rows = [
    { gold: 1, grey: 12 },
    { gold: 1, grey: 18 },
    { gold: 2, grey: 26 },
  ];
  return (
    <Frame label="Ledger: small gold blocks for attacker cost against long grey bars for defender cost.">
      {rows.map((r, i) => {
        const y = 2 + i * 4;
        return (
          <g key={y}>
            <rect x={4} y={y} width={r.gold} height={2} fill={GOLD} />
            <rect x={12} y={y} width={r.grey} height={2} fill={GREY} />
          </g>
        );
      })}
      <rect x={9} y={1} width={1} height={H - 2} fill={GREY_2} />
    </Frame>
  );
}

/** FIG.03 — two stacked layers: a thin grey airframe slab under a thick gold software slab. */
function Margin() {
  return (
    <Frame label="Two stacked layers: a thin grey airframe slab beneath a thick gold software layer.">
      <rect x={8} y={3} width={32} height={6} fill={GOLD} />
      <rect x={8} y={11} width={32} height={2} fill={GREY} />
      {[10, 18, 26, 34].map((x) => (
        <rect key={x} x={x} y={9} width={1} height={2} fill={GREY_2} />
      ))}
    </Frame>
  );
}

/** FIG.04 — a pyramid of grey squares becoming a three-layer gold mesh joined by lines. */
function Mesh() {
  const pyramid: { x: number; y: number }[] = [];
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) pyramid.push({ x: 8 - row + i * 2, y: 3 + row * 3 });
  }
  const layers = [
    { y: 3, xs: [26, 32, 38] },
    { y: 8, xs: [28, 34, 40] },
    { y: 13, xs: [26, 32, 38] },
  ];
  return (
    <Frame label="A pyramid of grey squares on the left becoming a three-layer mesh of gold squares connected by lines on the right.">
      {pyramid.map((p) => (
        <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={1} height={1} fill={GREY} />
      ))}
      <rect x={16} y={8} width={5} height={1} fill={GREY_2} />
      <rect x={20} y={7} width={1} height={3} fill={GREY_2} />
      {layers.map((l, li) => (
        <g key={l.y}>
          {l.xs.map((x, xi) => {
            const next = layers[li + 1];
            const nx = next?.xs[xi];
            return (
              <g key={x}>
                {next && nx !== undefined && (
                  <line x1={x + 0.5} y1={l.y + 1} x2={nx + 0.5} y2={next.y} stroke={GOLD} strokeWidth={0.25} shapeRendering="auto" />
                )}
                {xi < l.xs.length - 1 && <rect x={x + 1} y={l.y + 0.5} width={l.xs[xi + 1] - x - 1} height={0.25} fill={GOLD} />}
                <rect x={x} y={l.y} width={1} height={1} fill={GOLD} />
              </g>
            );
          })}
        </g>
      ))}
    </Frame>
  );
}

const FIGURES: Record<Kind, () => JSX.Element> = { repricing: Repricing, ledger: Ledger, margin: Margin, mesh: Mesh };

/** Inline essay figure on the 8px grid, gold on warm grey. */
export function EssayFigure({ kind }: { kind: Kind }) {
  const Fig = FIGURES[kind];
  return <Fig />;
}
