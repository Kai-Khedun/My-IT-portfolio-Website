import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";
import { publicFile } from "@/lib/publicFile";

const pad = (n: number) => String(n).padStart(2, "0");

// One painted sky per project: colours only, no claims. A screenshot at public/work/<slug>/cover.webp wins.
type Palette = { sky: [string, string]; sun: string; hills: [string, string, string]; night?: boolean };
const PALETTES: Record<string, Palette> = {
  capri: { sky: ["#ffd3b4", "#fff2df"], sun: "#ff9a6b", hills: ["#f4b98a", "#e58e6c", "#c86f5c"] },
  dailyclicker: { sky: ["#c7e4fa", "#fff5dc"], sun: "#ffd36e", hills: ["#c5e3b6", "#9fcd9b", "#7db487"] },
  curbside: { sky: ["#c4efe3", "#f5fbf2"], sun: "#ffffff", hills: ["#acdccc", "#7fc4b3", "#5ba79b"] },
  hustlehub: { sky: ["#e1d6fa", "#fcf1f8"], sun: "#ffc7dc", hills: ["#d1c5f1", "#b5a7e6", "#9786d1"] },
  tetherfall: { sky: ["#1d3a64", "#46729a"], sun: "#fff1c4", hills: ["#2c5678", "#1f4364", "#16304d"], night: true },
  "jester-king": { sky: ["#38295c", "#7c5089"], sun: "#ffd772", hills: ["#5c3f79", "#47305f", "#33224a"], night: true },
};
const FALLBACK: Palette = PALETTES.dailyclicker;

function hillPath(seed: number, base: number, amp: number) {
  let d = `M0 ${base}`;
  for (let x = 0; x <= 400; x += 20) {
    const y = base - amp * (0.6 * Math.sin(x * 0.012 + seed) + 0.4 * Math.sin(x * 0.031 + seed * 2.3));
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return `${d} L400 300 L0 300 Z`;
}

function Sparkle({ x, y, s }: { x: number; y: number; s: number }) {
  return <path d={`M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`} fill="#fff" />;
}

export function CoverArt({ slug }: { slug: string }) {
  const p = PALETTES[slug] ?? FALLBACK;
  const seed = [...slug].reduce((s, c) => s + c.charCodeAt(0), 0) % 17;
  const id = `g-${slug}`;
  const sunX = 90 + ((seed * 37) % 220);
  return (
    <svg className="cover-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor={p.sun} stopOpacity=".9" />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id})`} />
      <circle cx={sunX} cy="118" r="90" fill={`url(#${id}-sun)`} />
      <circle cx={sunX} cy="118" r="26" fill={p.sun} />
      {p.night ? (
        <g opacity=".85">
          <Sparkle x={52} y={46} s={6} />
          <Sparkle x={330} y={70} s={8} />
          <Sparkle x={250} y={34} s={4} />
          <Sparkle x={140} y={78} s={3.5} />
        </g>
      ) : (
        <g fill="#fff" opacity=".85">
          <ellipse cx={(sunX + 150) % 400} cy="78" rx="46" ry="14" />
          <ellipse cx={(sunX + 170) % 400} cy="68" rx="26" ry="14" />
          <ellipse cx={(sunX + 260) % 400} cy="112" rx="34" ry="10" />
        </g>
      )}
      <path d={hillPath(seed, 205, 22)} fill={p.hills[0]} />
      <path d={hillPath(seed + 4, 236, 18)} fill={p.hills[1]} />
      <path d={hillPath(seed + 9, 268, 14)} fill={p.hills[2]} />
    </svg>
  );
}

/** Screenshot if Kai has added one, otherwise the painted sky. */
export function Cover({ p }: { p: Project }) {
  const shot = publicFile(`/work/${p.slug}/cover.webp`);
  return shot ? <Image src={shot} alt="" fill sizes="(max-width: 640px) 80vw, 420px" className="object-cover" /> : <CoverArt slug={p.slug} />;
}

export function ProjectCard({ p, i }: { p: Project; i: number }) {
  return (
    <article className="pcard">
      <div className="pcard-art">
        <Cover p={p} />
        <span className="pcard-no">{pad(i + 1)}</span>
      </div>
      <div className="pcard-body">
        <h3 className="pcard-title">
          <Link className="pcard-link" href={`/work/${p.slug}`}>
            {p.title}
          </Link>
        </h3>
        <p className="pcard-line">{p.line}</p>
        <p className="pcard-foot">
          <span className="tag">
            <span aria-hidden="true">✦ </span>
            {p.status}
          </span>
          <span>{p.when}</span>
        </p>
      </div>
    </article>
  );
}
