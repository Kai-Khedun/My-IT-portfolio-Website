// Kai's coil mark: an Archimedean spiral, 4.25 turns, stroke 0.46 of the gap between turns (56 / 4.25 * 0.46 ≈ 6).
const TURNS = 4.25;
const RADIUS = 56;
const pts: string[] = [];
for (let a = 0; a <= Math.PI * 2 * TURNS + 1e-6; a += 0.06) {
  const r = ((RADIUS / TURNS) * a) / (Math.PI * 2);
  pts.push(`${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`);
}
export const COIL_PATH = "M" + pts.join("L");

export function CoilMark({ size = 132, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="-66 -66 132 132" aria-hidden="true" focusable="false">
      <path d={COIL_PATH} fill="none" stroke="#e7ebf3" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
