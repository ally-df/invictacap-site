import type { ReactNode } from "react";
import { layoutText } from "@/lib/pixelFont";
import { PixelText } from "./PixelText";

type Props = {
  id: string;
  number: string;
  label: string;
  /** Emitted as `data-scene-anchor` for the 3D layer to position set-pieces. */
  anchor?: string;
  headline: readonly string[];
  headingAs?: "h1" | "h2";
  children: ReactNode;
};

/** Column width in grid units (768 / 8). */
const COL_UNITS = 96;

/** Headline cell size: 2 units when the widest line fits the column, else 1 unit. */
function headlineCell(lines: readonly string[]) {
  const { width } = layoutText(lines);
  return width * 2 <= COL_UNITS ? 16 : 8;
}

/** Numbered manifesto section: flag + label board, pixel headline, then content. */
export function Section({ id, number, label, anchor, headline, headingAs = "h2", children }: Props) {
  return (
    <section id={id} data-scene-anchor={anchor} className="relative" style={{ paddingBlock: "calc(var(--unit) * 16)" }}>
      <div className="col">
        <header style={{ marginBottom: "calc(var(--unit) * 8)" }}>
          <p className="label flex items-center" style={{ gap: "calc(var(--unit) * 2)" }}>
            <span aria-hidden="true" className="block bg-gold" style={{ width: "calc(var(--unit) * 2)", height: "calc(var(--unit) * 2)" }} />
            <span>
              {number}. {label}
            </span>
          </p>
          <PixelText as={headingAs} lines={headline} cell={headlineCell(headline)} className="text-gold" style={{ marginTop: "calc(var(--unit) * 8)" }} />
        </header>
        {children}
      </div>
    </section>
  );
}
