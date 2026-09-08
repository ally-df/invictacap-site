import { ImageResponse } from "next/og";
import { MARK_BITMAP } from "@/lib/voxelMark";
import { brand } from "@/content/site";

export const runtime = "edge";
export const alt = "Invicta Capital — Private Markets Investment Fund";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#c9a96e";
const BG = "#08080a";
const UNIT = 26;

export default function OgImage() {
  const rows = MARK_BITMAP;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          backgroundImage:
            "linear-gradient(to right, rgba(201,169,110,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(201,169,110,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          gap: 72,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {rows.map((row, y) => (
            <div key={y} style={{ display: "flex" }}>
              {row.split("").map((c, x) => (
                <div key={x} style={{ width: UNIT, height: UNIT, background: c === "#" ? GOLD : "transparent" }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ color: GOLD, fontSize: 56, letterSpacing: 10, fontFamily: "monospace" }}>{brand.wordmark}</div>
          <div style={{ color: "#8a8578", fontSize: 22, letterSpacing: 8, fontFamily: "monospace" }}>
            {brand.tagline.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
