// System diagrams ported from reference/current-prototype.html. Styled by the .bp rules in globals.css.
// Arrowheads (#ar, #arh) come from <ArrowDefs/>, rendered once in the root layout.
import type { ReactNode } from "react";

export type DiagramId = "capri-system" | "capri-pipeline" | "daily-boot" | "curbside-monorepo" | "hustle-plan";

const AR = "url(#ar)";
const ARH = "url(#arh)";

const DIAGRAMS: Record<DiagramId, { viewBox: string; title: string; body: ReactNode }> = {
  "capri-system": {
    viewBox: "0 0 660 430",
    title:
      "Capri system overview. The website, mobile app and owner dashboard share one API backed by PostgreSQL and Firestore.",
    body: (
      <>
        <rect className="box" x="16" y="20" width="190" height="58" rx="3" />
        <text className="t" x="30" y="44">WEBSITE</text>
        <text className="t2" x="30" y="63">Next.js · Vercel</text>
        <rect className="box" x="235" y="20" width="190" height="58" rx="3" />
        <text className="t" x="249" y="44">MOBILE APP</text>
        <text className="t2" x="249" y="63">Expo · iOS + Android</text>
        <rect className="box" x="454" y="20" width="190" height="58" rx="3" />
        <text className="t" x="468" y="44">OWNER DASHBOARD</text>
        <text className="t2" x="468" y="63">admin · live orders</text>
        <path className="ln" d="M111 78V112H549V78" />
        <path className="ln" d="M330 78V146" markerEnd={AR} />
        <rect className="box hot" x="190" y="150" width="280" height="60" rx="3" />
        <text className="t" x="206" y="175">API</text>
        <text className="t2" x="206" y="194">Next.js API routes · Supabase</text>
        <path className="ln hot" d="M330 210V240H175V268" markerEnd={ARH} />
        <path className="ln hot" d="M330 240H485V268" markerEnd={ARH} />
        <rect className="box hot" x="40" y="272" width="270" height="62" rx="3" />
        <text className="t" x="56" y="297">POSTGRESQL · 13 TABLES</text>
        <text className="t2" x="56" y="317">orders · bookings · payments · stock</text>
        <rect className="box hot" x="350" y="272" width="270" height="62" rx="3" />
        <text className="t" x="366" y="297">FIRESTORE · 4 COLLECTIONS</text>
        <text className="t2" x="366" y="317">carts · live orders · specs · audit</text>
        <path className="ln dash" d="M620 303H650V49H648" markerEnd={AR} />
        <text className="t2" transform="translate(642 262) rotate(-90)">realtime</text>
        <path className="ln hot" d="M56 334V398M56 358H66M56 378H66M56 398H66" />
        <text className="ann" x="74" y="362" xmlSpace="preserve">EXCLUDE    no double-booked pool tables</text>
        <text className="ann" x="74" y="382" xmlSpace="preserve">STOCK ≥ 0  no overselling in the shop</text>
        <text className="ann" x="74" y="402" xmlSpace="preserve">RLS        customers see only their orders</text>
      </>
    ),
  },
  "capri-pipeline": {
    viewBox: "0 0 660 64",
    title: "Delivery pipeline: commit, pull request, CI on GitHub Actions, review, main, then deploy to Vercel and Expo EAS.",
    body: (
      <>
        {["commit", "pull request", "CI · Actions", "review", "main", "Vercel · EAS"].map((label, i) => {
          const x = 9 + 110 * i;
          const last = i === 5;
          return (
            <g key={label}>
              {i > 0 && (
                <path className={last ? "ln hot" : "ln"} d={`M${x - 18} 31H${x - 2}`} markerEnd={last ? ARH : AR} />
              )}
              <rect className={i === 2 || last ? "box hot" : "box"} x={x} y="14" width="92" height="34" rx="17" />
              <text className="t2 mid" x={x + 46} y="35">{label}</text>
            </g>
          );
        })}
      </>
    ),
  },
  "daily-boot": {
    viewBox: "0 0 660 300",
    title:
      "DailyClicker flow: the PC powers on, DailyClicker opens with tasks, goals, a quote and an inbox scan, and it also installs on an iPhone.",
    body: (
      <>
        <rect className="box" x="16" y="122" width="116" height="52" rx="3" />
        <text className="t" x="30" y="146">POWER ON</text>
        <text className="t2" x="30" y="163">PC starts up</text>
        <path className="ln hot" d="M132 148H164" markerEnd={ARH} />
        <rect className="box hot" x="168" y="18" width="322" height="264" rx="4" />
        <text className="t" x="186" y="44">DAILYCLICKER</text>
        <text className="t2" x="186" y="62">today, before anything else</text>
        <rect className="box" x="186" y="80" width="136" height="84" rx="2" />
        <text className="t" x="200" y="104">TASKS</text>
        <text className="t2" x="200" y="121">for today</text>
        <path className="ln" d="M200 139h8M214 139h86M200 151h8M214 151h64" />
        <rect className="box" x="338" y="80" width="136" height="84" rx="2" />
        <text className="t" x="352" y="104">GOALS</text>
        <text className="t2" x="352" y="121">big picture</text>
        <rect className="box" x="186" y="180" width="136" height="84" rx="2" />
        <text className="t" x="200" y="204">QUOTE</text>
        <text className="t2" x="200" y="221">one to read</text>
        <rect className="box" x="338" y="180" width="136" height="84" rx="2" />
        <text className="t" x="352" y="204">INBOX SCAN</text>
        <text className="t2" x="352" y="221">what&apos;s important</text>
        <path className="ln dash" d="M490 148H534" markerEnd={AR} />
        <text className="t2" x="496" y="140">iPhone</text>
        <rect className="box" x="540" y="56" width="104" height="186" rx="16" />
        <path className="ln" d="M576 68h32" />
        <rect className="box hot" x="572" y="104" width="40" height="40" rx="9" />
        <text className="t2 mid" x="592" y="168">add to</text>
        <text className="t2 mid" x="592" y="182">home screen</text>
        <text className="t2" x="540" y="270">offline + online</text>
      </>
    ),
  },
  "curbside-monorepo": {
    viewBox: "0 0 660 300",
    title:
      "CURBSIDE monorepo: Android app and Ktor server share one models module; the server runs on Azure; turbo power and car rarity feed the catch odds.",
    body: (
      <>
        <rect className="frame" x="16" y="18" width="432" height="264" rx="4" />
        <text className="t2" x="32" y="42">curbside/ · monorepo</text>
        <rect className="box" x="36" y="62" width="180" height="64" rx="3" />
        <text className="t" x="50" y="88">ANDROID APP</text>
        <text className="t2" x="50" y="107">Kotlin · scan + garage</text>
        <path className="ln" d="M220 94H240" markerStart={AR} markerEnd={AR} />
        <rect className="box hot" x="244" y="62" width="180" height="64" rx="3" />
        <text className="t" x="258" y="88">SERVER</text>
        <text className="t2" x="258" y="107">Ktor · REST API</text>
        <path className="ln" d="M126 126V158H334V126" />
        <path className="ln" d="M230 158V186" markerEnd={AR} />
        <rect className="box" x="140" y="190" width="180" height="64" rx="3" />
        <text className="t" x="154" y="216">SHARED MODELS</text>
        <text className="t2" x="154" y="235">one source of truth</text>
        <path className="ln" d="M424 94H472" markerEnd={AR} />
        <rect className="box" x="476" y="62" width="168" height="64" rx="3" />
        <text className="t" x="490" y="88">AZURE</text>
        <text className="t2" x="490" y="107">hosts the API</text>
        <text className="t2" x="482" y="152">power</text>
        <text className="t2" x="572" y="152">rarity</text>
        <rect className="box" x="476" y="158" width="76" height="40" rx="3" />
        <text className="t mid" x="514" y="182">TURBO</text>
        <rect className="box" x="568" y="158" width="76" height="40" rx="3" />
        <text className="t mid" x="606" y="182">CAR</text>
        <path className="ln hot" d="M514 198V214H606V198M560 214V230" markerEnd={ARH} />
        <rect className="box hot" x="476" y="234" width="168" height="48" rx="3" />
        <text className="t" x="490" y="256">CATCH ODDS</text>
        <text className="t2" x="490" y="272">my maths</text>
      </>
    ),
  },
  "hustle-plan": {
    viewBox: "0 0 660 236",
    title:
      "HustleHub+ was built in three parts: secure backend, full stack, then DevSecOps; every change merges into a protected main branch through a reviewed pull request.",
    body: (
      <>
        <rect className="box" x="16" y="20" width="196" height="76" rx="3" />
        <text className="t2" x="30" y="42">PART 1</text>
        <text className="t" x="30" y="62">SECURE BACKEND</text>
        <text className="t2" x="30" y="81">foundations first</text>
        <path className="ln" d="M212 58H228" markerEnd={AR} />
        <rect className="box" x="232" y="20" width="196" height="76" rx="3" />
        <text className="t2" x="246" y="42">PART 2</text>
        <text className="t" x="246" y="62">FULL STACK</text>
        <text className="t2" x="246" y="81">MERN · React UI</text>
        <path className="ln" d="M428 58H444" markerEnd={AR} />
        <rect className="box" x="448" y="20" width="196" height="76" rx="3" />
        <text className="t2" x="462" y="42">PART 3</text>
        <text className="t" x="462" y="62">DEVSECOPS</text>
        <text className="t2" x="462" y="81">pipelines · monitoring</text>
        <path className="ln" d="M16 186H644" />
        <path className="ln" d="M70 186C90 186 90 150 110 150H180C200 150 200 186 220 186" />
        <path className="ln" d="M250 186C270 186 270 150 290 150H380C400 150 400 186 420 186" />
        <path className="ln" d="M450 186C470 186 470 150 490 150H560C580 150 580 186 600 186" />
        <circle className="dot" cx="220" cy="186" r="4" />
        <circle className="dot" cx="420" cy="186" r="4" />
        <circle className="dot" cx="600" cy="186" r="4" />
        <text className="t2" x="112" y="140">feature branch</text>
        <text className="t2" x="292" y="140">PR + 1 approval</text>
        <text className="t2" x="492" y="140">merge to main</text>
        <text className="t2" x="16" y="214">main · protected</text>
      </>
    ),
  },
};

/** Decorative copies (card covers) are hidden from screen readers; figures get a label. */
export function Diagram({ id, decorative = false }: { id: DiagramId; decorative?: boolean }) {
  const d = DIAGRAMS[id];
  return (
    <svg
      className="bp"
      viewBox={d.viewBox}
      {...(decorative ? { "aria-hidden": true, focusable: false } : { role: "img", "aria-label": d.title })}
    >
      {d.body}
    </svg>
  );
}

export function ArrowDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path className="ar" d="M0 0L8 4L0 8z" />
        </marker>
        <marker id="arh" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path className="ar-hot" d="M0 0L8 4L0 8z" />
        </marker>
      </defs>
    </svg>
  );
}
