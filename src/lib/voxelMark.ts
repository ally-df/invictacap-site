/**
 * The Invicta mark: an 8x8 gold square frame with a bold "V" hanging from its top bar.
 * '#' = gold cell, '.' = empty. Used for the logo (3D + SVG), favicon, OG image.
 */
export const MARK_SIZE = 8;

export const MARK_BITMAP: readonly string[] = [
  "########",
  "##....##",
  "##....##",
  "#.#..#.#",
  "#.#..#.#",
  "#..##..#",
  "#..##..#",
  "########",
];

export type MarkCell = { x: number; y: number };

export function markCells(): MarkCell[] {
  const cells: MarkCell[] = [];
  MARK_BITMAP.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === "#") cells.push({ x, y });
  });
  return cells;
}

/** Inline SVG string for the mark, at any pixel size. */
export function markSvg(size = 64, color = "#c9a96e", bg?: string): string {
  const unit = size / MARK_SIZE;
  const rects = markCells()
    .map((c) => `<rect x="${c.x * unit}" y="${c.y * unit}" width="${unit}" height="${unit}" fill="${color}"/>`)
    .join("");
  const bgRect = bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${bgRect}${rects}</svg>`;
}
