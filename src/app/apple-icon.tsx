import { ImageResponse } from "next/og";
import { MARK_BITMAP } from "@/lib/voxelMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const unit = 16;
  const pad = (180 - unit * 8) / 2;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#08080a", display: "flex", padding: pad }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {MARK_BITMAP.map((row, y) => (
            <div key={y} style={{ display: "flex" }}>
              {row.split("").map((c, x) => (
                <div key={x} style={{ width: unit, height: unit, background: c === "#" ? "#c9a96e" : "transparent" }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
