import { ImageResponse } from "next/og";

// Home-screen icon: the favicon's sparkle on a sky tile.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #a6d1f1, #f6ead8)" }}>
        <svg width="112" height="112" viewBox="0 0 24 24">
          <path d="M12 1Q12.5 11.5 23 12Q12.5 12.5 12 23Q11.5 12.5 1 12Q11.5 11.5 12 1Z" fill="#d9694f" />
        </svg>
      </div>
    ),
    size,
  );
}
