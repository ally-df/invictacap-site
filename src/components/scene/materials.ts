"use client";

import { BoxGeometry, Color, Matrix4, MeshLambertMaterial, Vector3 } from "three";
import { hash01 } from "@/lib/easing";

/** Brand colours (mirrors globals.css). */
export const BG = "#08080a";
export const GOLD = "#c9a96e";
export const GOLD_LIGHT = "#dfc08a";
export const GOLD_PALE = "#e8d5a8";
export const GREY = "#4a463f";
export const GREY_DARK = "#2a2824";

/** `gold` / `grey` are mixed palettes (textured by hash); any other string is a literal hex. */
export type ColorSpec = "gold" | "grey" | (string & {});

/** Pick a shade for a cube given a palette and a deterministic random in [0,1). */
export function resolveColor(spec: ColorSpec, r: number): string {
  if (spec === "gold") return r < 0.68 ? GOLD : r < 0.9 ? GOLD_LIGHT : GOLD_PALE;
  if (spec === "grey") return r < 0.7 ? GREY : GREY_DARK;
  return spec;
}

export const cubeShade = (spec: ColorSpec, seed: number, i: number) => resolveColor(spec, hash01(seed * 7919 + i * 131 + 977));

/* ───────── Shared GPU resources (module singletons, never disposed) ───────── */

export const BOX_GEO = new BoxGeometry(1, 1, 1);

/** White base colour; per-cube colour comes from `instanceColor`. */
export const MAT_OPAQUE = new MeshLambertMaterial({ color: 0xffffff, flatShading: true });

/** Low-contrast variant for pieces sitting behind the text column (compact / narrow viewports). */
export const MAT_DIM = new MeshLambertMaterial({
  color: 0xffffff,
  flatShading: true,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
});

/* ───────── Scratch objects for per-frame math (never allocate in useFrame) ───────── */

export const tmpColor = new Color();
export const tmpMatrix = new Matrix4();
export const tmpVec = new Vector3();
export const AXES: readonly Vector3[] = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
