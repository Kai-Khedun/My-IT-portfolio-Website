import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

// Social preview: the landing scene as a flat painting. Built at build time; uses the default font.
export const alt = `${profile.name} · ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function hill(seed: number, base: number, amp: number) {
  let d = `M0 ${base}`;
  for (let x = 0; x <= 1200; x += 40) {
    const y = base - amp * (0.6 * Math.sin(x * 0.004 + seed) + 0.4 * Math.sin(x * 0.011 + seed * 2.3));
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return `${d} L1200 300 L0 300 Z`;
}

const cloud = (left: number, top: number, s: number) => (
  <div style={{ position: "absolute", left, top, display: "flex", alignItems: "flex-end" }}>
    <div style={{ width: 70 * s, height: 46 * s, borderRadius: 999, background: "rgba(255,255,255,.9)" }} />
    <div style={{ width: 92 * s, height: 70 * s, borderRadius: 999, background: "rgba(255,255,255,.9)", marginLeft: -26 * s }} />
    <div style={{ width: 64 * s, height: 40 * s, borderRadius: 999, background: "rgba(255,255,255,.9)", marginLeft: -24 * s }} />
  </div>
);

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(180deg, #9fcdf0 0%, #f6ead8 78%)" }}>
        {cloud(760, 70, 1.3)}
        {cloud(980, 190, 0.8)}
        <svg style={{ position: "absolute", left: 0, bottom: 0 }} width="1200" height="300" viewBox="0 0 1200 300">
          <path d={hill(1, 150, 30)} fill="#b9d595" />
          <path d={hill(5, 205, 26)} fill="#9cc785" />
          <path d={hill(9, 255, 18)} fill="#7fb378" />
          {/* the car, side on */}
          <g transform="translate(860 168)">
            <rect x="8" y="-34" width="62" height="16" rx="5" fill="#e07a5f" />
            <rect x="0" y="-18" width="86" height="6" rx="3" fill="#6b5a4d" />
            <rect x="6" y="-12" width="74" height="34" rx="14" fill="#f7efe1" />
            <rect x="14" y="-6" width="26" height="18" rx="5" fill="#8fb4d2" />
            <rect x="46" y="-6" width="26" height="18" rx="5" fill="#8fb4d2" />
            <rect x="-14" y="14" width="114" height="30" rx="14" fill="#8fd0c0" />
            <circle cx="12" cy="44" r="13" fill="#2d3541" />
            <circle cx="12" cy="44" r="5" fill="#f7efe1" />
            <circle cx="74" cy="44" r="13" fill="#2d3541" />
            <circle cx="74" cy="44" r="5" fill="#f7efe1" />
          </g>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", padding: "84px 90px", color: "#26313d" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 22, letterSpacing: 5, color: "#a8472b" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" style={{ marginRight: 14 }}>
              <path d="M12 1Q12.5 11.5 23 12Q12.5 12.5 12 23Q11.5 12.5 1 12Q11.5 11.5 12 1Z" fill="#d9694f" />
            </svg>
            PORTFOLIO 2026
          </div>
          <div style={{ fontSize: 108, letterSpacing: -4, lineHeight: 1, marginTop: 22 }}>{profile.name}</div>
          <div style={{ fontSize: 32, lineHeight: 1.4, color: "#4b5967", marginTop: 26, maxWidth: 720 }}>{profile.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
