# Portfolio build brief: Kaiyur Khedun

This is the full spec for rebuilding Kai's portfolio as a real, deployable website. Read it end to end before writing code. `reference/current-prototype.html` is the current single-file version of the site. It is the source of truth for copy, colours, the WebGL intro, and the project diagrams.

---

## 0. Quick facts

| | |
|---|---|
| Owner | Kaiyur Khedun (goes by **Kai**), backend developer, Durban, South Africa |
| Project root | `E:\Projects\Portfolio Website\My IT portfolio Website` (Windows; the path has spaces, so always quote it) |
| Deadline | MVP live by **24 Nov 2026**. Kai flies to New Zealand on 25 Nov and wants to show it to family |
| Audience | Family (non-technical) and recruiters/clients (technical) |
| Feel | Sleek, refined, simple, elegant. It must not look like a generic AI-made template |
| Signature moments | (1) LOADING bar, then an LED-dot icon in a curved dome grid that twists into a moving spiral on scroll. (2) **Card Arc Carousel** for the work section |

---

## 1. Ground rules

1. Work **only** inside the project root. Check what's already there first, and don't delete or overwrite anything you didn't create without asking Kai.
2. **Never invent facts** about Kai: no dates, employers, grades, links, metrics, testimonials or client quotes that aren't in this brief. Where something is missing, render nothing (or a neutral fallback) and leave a `TODO(kai): …` comment in code. Keep a running list of these in `TODO-KAI.md`.
3. Copy comes from section 9 (Copy deck) word for word. Small fixes for layout are fine; new claims are not.
4. Use Git. Run `git init` if needed, commit at the end of each phase with conventional commits (`feat:`, `fix:`, `chore:`). **Don't push or deploy without asking.** Kai's personal projects go on his **personal** GitHub, never his school account. Ask him which account to use.
5. Before calling a phase done, run `npm run build` and `npm run lint`, and fix anything that fails.
6. Respect `prefers-reduced-motion` everywhere (spec in section 11).
7. Windows: use PowerShell-friendly commands. Quote paths. Don't assume bash.

---

## 2. Stack

Install the **current stable** version of each package at build time (check with `npm view <pkg> version`), and record exact versions in `package.json`.

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js** (App Router) + **TypeScript** | Static where possible (`generateStaticParams` for case pages) |
| Styling | **Tailwind CSS** (current major) + CSS variables for tokens | Tokens in `app/globals.css`, exposed to Tailwind via `@theme` |
| Scroll + motion | **GSAP** + **ScrollTrigger** + **SplitText** | All GSAP plugins are free now. Use `@gsap/react`'s `useGSAP` for cleanup |
| Smooth scroll | **Lenis** | Drive it from GSAP's ticker and call `ScrollTrigger.update` on Lenis scroll. Turn it off for reduced motion |
| WebGL intro | **Raw WebGL 1**, ported from the prototype into a client component | No three.js needed. The shaders are already written and tested. Dynamically import the component (`ssr: false`) so it doesn't block first paint |
| Fonts | `next/font/google`: **Doto**, **Instrument Sans**, **Martian Mono** | If Doto isn't available in `next/font`, self-host it with `@fontsource-variable/doto` |
| Package manager | npm | Node LTS |
| Hosting | Vercel (ask before deploying) | |

Do **not** add a UI kit (shadcn, MUI, etc.), icon packs, or analytics unless Kai asks.

---

## 3. Information architecture

```
/                 One-page home: Intro → About → Work (Card Arc Carousel) → Also built → CV teaser → Contact → Footer
/work/[slug]      Case study pages, one per carousel card (6)
/cv               Readable CV page with a print stylesheet
/not-found        Styled 404 ("SHEET NOT FOUND")
```

Suggested structure:

```
app/
  layout.tsx            fonts, metadata, <SmoothScroll>, <Nav>, fixed <Backdrop> canvas
  page.tsx              home
  work/[slug]/page.tsx
  cv/page.tsx
  not-found.tsx
  opengraph-image.tsx   generated OG image (next/og)
  icon.svg              coil mark favicon
components/
  Loader.tsx  IntroScene.tsx  Nav.tsx  SheetHead.tsx
  ArcCarousel/ArcCarousel.tsx  ArcCarousel/ProjectCard.tsx  ArcCarousel/ArcRuler.tsx
  LineReveal.tsx  Diagram/*.tsx  CvSheet.tsx  SmoothScroll.tsx
content/
  projects.ts  profile.ts  cv.ts
lib/
  gl/ (shaders + helpers ported from the prototype)  motion.ts  useReducedMotion.ts
public/
  work/<slug>/cover.webp   (TODO(kai): screenshots)
  cv/Kaiyur-Khedun-CV.pdf  (TODO(kai): optional)
```

---

## 4. Design system

### 4.1 Concept

**"A drawing set at night."** Each section is a numbered sheet, like an engineering drawing (`02 · About … Sheet 02 of 05`), with crop marks, parts lists and system diagrams. Display type is an LED dot-matrix face. Colour is cold and dark, with one **thermal** accent (heat orange) and a full thermal gradient that only appears in the spiral. It's the portfolio of someone who builds systems, so it should read like a technical document drawn with care.

### 4.2 Colour tokens (use exactly these)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#05070b` | Page background |
| `--ink-2` | `#0a0e15` | Panels, cards |
| `--ink-3` | `#101722` | Raised surfaces |
| `--rule` | `#18212e` | Hairlines |
| `--rule-2` | `#26344a` | Stronger hairlines, card borders |
| `--fg` | `#e7ebf1` | Primary text |
| `--fg-2` | `#b6bfcc` | Body text |
| `--muted` | `#7b8697` | Labels |
| `--cold` | `#8fb6ec` | Blueprint lines |
| `--hot` | `#ff9d3c` | The one accent: "built by me", active states, focus rings |
| `--heat-1…5` | `#2a0b55 #86166e #e0414a #ff8a1f #ffd66b` | Thermal gradient (spiral, hover on primary button only) |
| `--paper` / `--paper-ink` | `#f6f7f8` / `#0d1117` | CV page |
| `--paper-2` / `--paper-muted` / `--paper-rule` / `--paper-accent` | `#3c4552` / `#6a7482` / `#d8dde4` / `#1d45c2` | CV page |

The site is dark only, by choice. Set `color-scheme: dark` and an explicit body background. The CV page uses the paper tokens.

### 4.3 Type

| Role | Face | Settings |
|---|---|---|
| Display (name, section titles, card titles, LOADING, big numerals) | **Doto** | 700–900, uppercase, letter-spacing .02–.08em. Never for body text or below ~14px |
| Body | **Instrument Sans** | 400–600, 17px/1.65 base; lead text 23–32px/1.3 weight 500 |
| Labels / meta / nav | **Martian Mono** | 11–12px, uppercase, letter-spacing .06em, `font-stretch: 87.5%` |

Type scale (fluid with `clamp`): 11 / 12 / 15 / 17 / 20 / 26 / 34 / 48 / 64. Headings get `text-wrap: balance`. Keep body text at about 65 characters wide.

### 4.4 Layout

- Max content width 1280px, side gutter `max(20px, env(safe-area-inset-left))` and the same on the right.
- Every sheet starts with a `SheetHead`: a mono row with left `0N · Name` and right `Sheet 0N of 05`, then a 1px `--rule-2` line.
- Blueprint crop marks (four 14px L-corners) on figures and cards. The prototype has a `.crop` CSS recipe.
- Use hairlines and spacing, not boxes. Only cards and figures get a border.
- No horizontal page scroll at any width. Wide diagrams scroll inside their own `overflow-x: auto` box.

### 4.5 Motion principles

- Each section gets **one** orchestrated moment. Everything else stays still.
- Easing: `cubic-bezier(.16,1,.3,1)` for entrances, `power2.inOut` for scrubbed or snap motion.
- Durations: 0.6–1.2s for entrances, 0.35–0.6s for snaps.
- Content must be readable at rest. Never leave text at `opacity: 0` waiting for a trigger it might never get. If JS fails, everything shows.
- Pinned sections: only the intro and the carousel.

### 4.6 Anti-slop rules

No purple-to-blue gradients, glassmorphism cards everywhere, emoji, stock icons, fake stats or "trusted by" rows, lorem ipsum, generic centred hero with a gradient blob, `rounded-2xl shadow-xl` on everything, or Inter/Space Grotesk. Use one accent colour. Write copy in plain sentences, not marketing-speak.

---

## 5. Loader + intro (Sheet 01)

Port this from the prototype (`<script>` at the bottom and the `#loader` / `.hero` markup). Keep the behaviour and numbers below.

### 5.1 Loader

- Full-screen `#000`. Centred: **LOADING** in Doto 800 (22–30px, letter-spacing .1em), and under it a pill bar 78×9px (1px outline at 75% `--fg`, inner fill `--fg` with a soft glow).
- Progress is time-based (1.9s on a first visit, 0.8s on repeat visits in the same session via `sessionStorage`). It holds at 86% until fonts **and** the WebGL scene are ready, then completes. Failsafes: finish at 5.6s in JS, and a CSS animation hides the loader at 6.5s even if JS dies.
- Skip the loader entirely for reduced motion, and on direct links to `/cv` or `/work/*`.
- When done: the loader fades (0.8s), the nav drops in, the LED icon boots (dots flicker on randomly over 1.1s), and the name and tagline **scramble** in (random characters resolving left to right, about 0.9s; real text sits in a visually hidden span for screen readers).

### 5.2 Intro scene (fixed WebGL canvas behind the whole site)

The section is about 250vh tall (210vh on phones) with a sticky 100svh stage. Hero progress `p = clamp((scrollY − heroTop) / (heroHeight − viewportHeight))`, smoothed with `ease = easeInOutCubic(p)`.

- **Background pass:** near-black with a soft cold centre glow, animated film grain (24fps, cycling over 61 frames so the hash never loses precision), and a vignette. A flat blueprint grid (24px minor, 120px major, `--cold` at low alpha) fades in **only after** the hero, behind the content sheets.
- **Dome grid (lines):** meridians and parallels on the inside of a sphere (radius 7, camera at z 4.2, FOV 50°). As `ease → 1` each vertex morphs into a **twisted tunnel** (radius 2.3, z from 2 to −18, twist 9.1 rad), so the grid becomes spiral helices. The tunnel rotates slowly over time.
- **LED icon (points):** Kai's **coil mark** (an Archimedean spiral, 4.25 turns, stroke width 0.46 of the spacing between turns) is drawn into an offscreen canvas and sampled into a dot grid (116² desktop, 88² phone). Each lit cell becomes a square LED point with depth equal to brightness, tilts with the mouse (±0.38 rad yaw, ±0.24 pitch, plus an idle sway), and gets a faint breathing shimmer. Dots near the cursor are pushed away (radius 0.2 in NDC).
- **The spiral:** while scrolling, each dot leaves at its own delay, swirls, and joins one of **three spiral arms** flowing towards the camera, with extra spiral-only particles (7000 desktop, 3200 phone) fading in. Colours run along a thermal ramp: white-hot at the far centre, through amber and red, to violet near the camera. Points change from LED squares to soft round dots. Scroll speed briefly speeds up the spin.
- After the hero the scene dims to about 40% and keeps moving behind the content.
- `PORTRAIT` constant: if Kai later supplies a front-facing photo (`TODO(kai)`), sample it instead of the coil (luminance becomes brightness and depth, with a radial edge fade). The prototype already has this branch.
- Performance: cap DPR at 1.75, drop the render scale by 20% if the average frame time is over 24ms across 90 frames, pause when the tab is hidden or a modal is open, and rebuild points only when crossing the 700px breakpoint.
- No WebGL: show a static SVG coil in the stage centre over a CSS grid background.

### 5.3 Intro layout (over the canvas)

- Left, vertically centred: **KAIYUR KHEDUN** (Doto 800, 24–42px), then the mono line `// PORTFOLIO   2026`.
- Right, vertically centred, max 27ch: the tagline in Doto 700, 13–16px, uppercase.
- Bottom row (mono): `DURBAN · 20:48 SAST` (live clock, Africa/Johannesburg), `SCROLL` with an animated 1px line, `READ MY CV ↗`.
- Phones: name at the top, tagline above the bottom row, coil in the middle.
- The text fades and lifts as `p` rises (gone by about p = 0.3).

### 5.4 Nav

Fixed, transparent over the intro, then solid (`rgba(5,7,11,.74)` with a 14px backdrop blur and a hairline) once past the hero. Left: **KAIYUR KHEDUN** in Doto 800 15px. Right (mono): `WORK  ABOUT  CV  LET'S TALK●` (the dot is `--hot` with a glow). Hide ABOUT below 560px.

---

## 6. About (Sheet 02)

- Two columns (7/5) that stack below 860px. Left: title **ABOUT**, then the lead, then three paragraphs. Right: a spec list (label/value rows with hairlines).
- **Line-by-line reveal** on the lead and paragraphs: split into lines with GSAP SplitText; each line slides up from a mask (`yPercent: 100 → 0`, stagger 0.08, 0.9s), once, when it enters the viewport. Re-split on resize. No reveal for reduced motion.
- Below the columns: a **parts list** table of qualifications (`Item | Qualification | Detail`) with mono item numbers in `--hot`.

---

## 7. Work: Card Arc Carousel (Sheet 03), the centrepiece

### 7.1 What it is

The section pins. Six project cards sit on a **huge circle whose centre is below the screen**, so you see the top of the arc: one card upright in the middle, its neighbours fanned out and tilted down the curve on both sides. Scrolling **rotates the wheel**: cards travel along the arc, and each one becomes the active card at the top. When scrolling stops, the wheel **snaps** so a card is always centred.

### 7.2 Geometry (desktop ≥ 1024px)

- `CARD_W = clamp(300px, 28vw, 420px)`, card aspect 4:5.
- `R = max(1200px, 1.25 × viewportWidth)` (the arc radius).
- Pivot (the circle's centre): `x = 50vw`, `y = activeCardCentreY + R`, where `activeCardCentreY = 50svh + 2svh`.
- Angle between cards: `STEP = (CARD_W × 1.14) / R` radians.
- For card `i` with progress `p` (0 … n−1): `θ = (i − p) × STEP`.
- Transform each card, positioned absolutely at the pivot:
  `translate(-50%, -50%) rotate(θ) translateY(−R) scale(s)`
  where `d = min(|i − p|, 3)`, `s = 1 − 0.10·d`, `opacity = 1 − 0.28·d`, and cards with `|i − p| > 3.2` get `visibility: hidden`.
- Cards keep their rotation (the fanned look). Don't counter-rotate them upright.
- Tablet (640–1023): `CARD_W = 46vw`, `R = 1.6 × viewportWidth`. Phone (< 640): `CARD_W = 76vw`, `R = 2.1 × viewportWidth`. Neighbours peek in at the edges.

### 7.3 Scroll mapping

- ScrollTrigger on the section: `pin: true`, `scrub: 0.6`, `end: "+=" + (n − 1) × 75vh` (55vh on phones), with `snap: { snapTo: 1 / (n − 1), duration: { min: .35, max: .6 }, ease: "power2.inOut", delay: .05 }`.
- `p = self.progress × (n − 1)`. Apply transforms with `gsap.quickSetter` or direct style writes in one rAF. Never read layout inside the update.
- It has to work with Lenis (drive ScrollTrigger from Lenis).

### 7.4 Around the cards

- **Arc ruler (blueprint detail):** an SVG arc concentric with the wheel, just below the cards (radius `R + CARD_H × 0.62`), with tick marks every `STEP / 5`, major ticks at each card's angle, and mono labels in degrees (`−24°  −12°  0°  +12°  +24°`). It rotates with the wheel, and the tick at 0° is `--hot`.
- **Big numeral:** behind the wheel, the active card's index (`01` … `06`) in Doto 900 at about 28vw, `--fg` at 5% opacity. It crossfades on index change.
- **Counter + controls** (bottom row, mono): `← PREV`, `02 / 06`, `NEXT →`, plus the active project's title, which re-reveals line by line on index change.
- The `SheetHead` and the **SELECTED WORK** title sit at the top of the pinned stage.

### 7.5 Card anatomy

```
┌───────────────────────────────┐  ink-2 @ 94%, 1px rule-2 border, radius 14px, crop marks
│ DWG 03.1             [STATUS] │  mono; DWG in --hot; status chip
│ ┌───────────────────────────┐ │
│ │  cover 16:10               │ │  screenshot if present, otherwise the project's diagram (Diagram/*)
│ └───────────────────────────┘ │
│ CAPRI PIZZA KITCHEN            │  Doto 800, 26–32px
│ Ordering, bookings and a pro…  │  Instrument Sans 16px, fg-2, 2 lines max
│ BACKEND LEAD · 2026            │  mono
│ [Supabase] [PostgreSQL] [+2]   │  max 3 chips + overflow count
│ Open case study →              │
└───────────────────────────────┘
```

- **Active card:** border `rgba(255,157,60,.55)`. On desktop hover it tilts up to 6° towards the cursor with a soft moving highlight (CSS only, `transform` and a radial gradient).
- **Other cards:** a little dimmer, and they brighten slightly on hover.
- Clicking a non-active card scrolls the wheel to it (`lenis.scrollTo(targetY, { duration: .9 })`). Clicking the active card (or its link) opens `/work/[slug]`.

### 7.6 Accessibility and fallbacks

- Markup: `<section aria-roledescription="carousel" aria-label="Selected work">` containing a `<ul>` of six `<li>`, each with a real `<a href="/work/slug">`. Prev/next are real `<button>`s. Arrow keys go to the previous/next card when the section is in view. Tabbing to a card scrolls it into the active slot. A polite live region announces "Project 2 of 6: DailyClicker" **after** a snap settles, not on every frame.
- **Reduced motion or no JS:** no pin and no wheel. The cards render as a normal vertical list (or a 2-column grid on desktop) with the same anatomy.
- It must stay at 60fps on a mid-range laptop. Only `transform` and `opacity` change, and `will-change: transform` is set on the cards while the section is pinned.

---

## 8. Other pages and sections

### 8.1 Also built (end of Sheet 03, after the carousel unpins)

A plain list of rows: name, what it is, stack (mono), status (mono, right-aligned). It has a hover wash `linear-gradient(90deg, rgba(255,157,60,.06), transparent 70%)` and stacks on phones.

### 8.2 CV teaser (Sheet 04)

Left: title **CV**, one line of copy, a four-row summary list, and the button `Open my CV ↗` going to `/cv`. Right: a live, scaled-down preview of the actual CV sheet (render `<CvSheet>` inside a fixed 820px-wide box scaled to fit), rotated −2.2° and straightening on hover.

### 8.3 Contact (Sheet 05)

**LET'S TALK** in Doto 900 (40–128px). One paragraph, a list of links (email, LinkedIn, GitHub: **`TODO(kai)`**, render only the ones that exist), and buttons `Read my CV` and `Back to top ↑`. Show the email as selectable text with a copy button.

### 8.4 `/work/[slug]` case study pages

A `SheetHead` (`DWG 03.N · <type>` / `Sheet 03.N`), title (Doto), one-liner, meta (role · when · status), summary, **What I built** list (orange 12px dash markers), figures (port the prototype's SVG diagrams as React components, keeping the "Orange = built by me" legend), stack chips, links (live/repo **only if provided**), and **Next project →** at the bottom. Optional: use the View Transitions API so the card cover morphs into the page header, if it's simple to do in the current Next.js.

### 8.5 `/cv`

A paper sheet (max 820px, `--paper` background) on the dark page, with a top bar holding `← Back`, `Print / Save as PDF` (`window.print()`), and `Download PDF` (only if `public/cv/Kaiyur-Khedun-CV.pdf` exists). Add a **print stylesheet**: A4, no nav or background, paper colours, avoid breaking inside entries. The content is in section 9.8.

### 8.6 Footer

Mono row: `© 2026 Kaiyur Khedun · Durban, South Africa` and `29.86°S 31.02°E`.

### 8.7 SEO and meta

`title: "Kaiyur Khedun · Backend Developer"`, a description based on the tagline, `metadataBase` (`TODO(kai)` domain), an OG image generated with `next/og` (black, dot-matrix name, coil mark, tagline), the coil mark as an SVG favicon, plus `sitemap.ts` and `robots.ts`.

---

## 9. Copy deck (use as written)

### 9.1 Intro
- Name: `KAIYUR KHEDUN`
- Sub: `// PORTFOLIO   2026`
- Tagline: `BACKEND DEVELOPER FROM DURBAN. I BUILD THE APIS, DATABASES AND PIPELINES BEHIND THE APP.`

### 9.2 About
**Lead:** I'm Kai. I studied marketing, then computer science, and now I build the part of the product nobody sees.

**P1:** My first degree was a BCom in Marketing. It taught me to start with the customer: who's ordering, what they expect to happen when they press the button, and what brings them back. I then went back for a degree in Computer Science, which I finished in 2026, and I've completed Google's IT Support certificate too.

**P2:** Most of my work sits behind the screen. I design schemas, write APIs, set up auth and build the pipelines that test and ship every change. I like rules that live in the database, where nobody can skip them, and a main branch nobody can push to without a review.

**P3:** This year I led three team builds with the same crew of four, including a full ordering, booking and shop platform for a real restaurant in Durban. I also tutor other students and put together setup kits so they can start coding on day one.

**Specs:**
| Label | Value |
|---|---|
| Focus | Backend architecture, APIs, CI/CD |
| Languages | C#, JavaScript, Kotlin, SQL |
| Frameworks | .NET / ASP.NET Core, Node.js + Express, Next.js, React, Expo, Ktor |
| Data | PostgreSQL, Supabase, Firestore, MongoDB |
| Shipping | GitHub Actions, Vercel, Azure, Expo EAS |
| Based | Durban, South Africa (UTC+2) |

**Parts list · qualifications:**
| Item | Qualification | Detail |
|---|---|---|
| 01 | Computer Science | The IIE, South Africa · completed 2026 |
| 02 | BCom in Marketing | First degree · completed · `TODO(kai): institution + year` |
| 03 | IT Support Professional Certificate | Google · completed · `TODO(kai): year` |

### 9.3 Work: section title
`SELECTED WORK`

### 9.4 Carousel projects (`content/projects.ts`, in this order)

**1. `capri`**
- DWG 03.1 · Client project · status chip `CLIENT PROJECT`
- Title: **Capri Pizza Kitchen**
- Line: Ordering, bookings and a pro shop for a Durban restaurant
- Meta: Backend lead · team lead · Jun – Nov 2026
- Summary: Capri is a family-run wood-fire pizza and burger spot in Malvern, Durban, with a pool club and a pro shop under one roof. We built one platform for all three: a website, an iOS and Android app, and a dashboard the owner runs himself. I built the entire backend.
- What I built:
  - One backend shared by the website, the mobile app and the owner dashboard
  - A hybrid data model: 13 PostgreSQL tables for anything that decides price or availability, 4 Firestore collections for carts, live order tracking and logs
  - Rules enforced by the database itself: no double-booked pool tables, no overselling in the shop, and customers only ever see their own orders
  - CI/CD on GitHub Actions. Every change goes through a pull request and a green pipeline before it reaches main
  - Led the team of four and handled the build with the client
- Stack: Supabase, PostgreSQL, Firestore, Next.js, Expo, GitHub Actions, Vercel
- Figures: Fig. 3.1 System overview; Fig. 3.2 Delivery pipeline (both in the prototype)
- Links: `TODO(kai): live site URL` (Kai wants this shown prominently once he provides it)

**2. `dailyclicker`** (`TODO(kai)`: confirm the name. His project folder is called "DailyLicker")
- DWG 03.2 · Personal tool · `PERSONAL TOOL`
- Title: **DailyClicker**
- Line: A morning dashboard that opens when my PC does
- Meta: Solo · design and build · 2026
- Summary: A personal check-in page in the style of heyclicky. When my PC switches on, it opens with today's tasks, my goals, a quote to read and a scan of my inbox that flags what actually matters.
- What I built:
  - Launches on startup, so the day starts on the plan instead of the inbox
  - An inbox scan that surfaces the emails worth reading first
  - Installs on my iPhone home screen and works offline and online
- Stack chips: Web app, iPhone home screen, Offline-ready
- Figure: Fig. 3.3 Boot sequence

**3. `curbside`**
- DWG 03.3 · Android game · `PROTOTYPE`
- Title: **CURBSIDE**
- Line: Pokémon Go for people who stop and stare at cars
- Meta: Team lead · catch maths · API design · 2026
- Summary: Spot a car in the street, scan it, and it lands in your garage with its real specs. Rare variants turn up by chance, some cars make you win a mini-game first, and the turbo you throw decides whether the catch sticks.
- What I built:
  - Led the team from research and planning through to the working prototype
  - Own the catch maths: how a turbo's power and a car's rarity turn into catch odds
  - Designed the REST API and the UML for a Kotlin (Ktor) server hosted on Azure
  - Built the vehicle detail screen in the Android app
- Stack: Kotlin, Ktor, Android, Azure
- Figure: Fig. 3.4 Monorepo and catch model

**4. `hustlehub`**
- DWG 03.4 · Web platform · `TEAM PROJECT`
- Title: **HustleHub+**
- Line: A secure marketplace for freelancers
- Meta: Team lead · 2026
- Summary: Freelancers list their services, clients browse and book them, and both sides get transaction records, income tracking and an estimate of the tax they owe. Security came first: the backend had to stand on its own before any UI existed.
- What I built:
  - Built in three increments: secure backend foundations, the full MERN app, then DevSecOps and monitoring
  - Protected main branch. Every change needs a pull request and an approval
  - Led the team of four across all three parts
- Stack: Node.js, Express, React, MongoDB
- Figure: Fig. 3.5 Build plan and branch rules

**5. `tetherfall`**
- DWG 03.5 · Roblox game · `IN BUILD`
- Title: **Tetherfall**
- Line: An extraction tycoon on Roblox
- Meta: Co-developer · 2026
- Summary: A Roblox extraction tycoon inspired by Pull a Lucky Fish and HELLHOLE, with its own twist. I'm building it with a friend who has already made much of the UI and art.
- What I built: `TODO(kai)` (leave the list out until Kai fills it in)
- Stack: Roblox Studio, Luau
- Cover: no diagram yet. Use a Doto monogram cover (`TF`) on a dot-pattern panel

**6. `jester-king`**
- DWG 03.6 · AI lab · `LAB`
- Title: **Jester King**
- Line: My own small language model, with a personality
- Meta: Solo · 2026
- Summary: A small open model fine-tuned with LoRA to run on my own machine, with no API in the loop. Its persona is a jester king: it helps you, and roasts you while it does.
- What I built:
  - Chose fine-tuning (LoRA/QLoRA) over training from scratch or RAG
  - Trains and runs locally on my own hardware
- Stack: LoRA, QLoRA
- Cover: Doto monogram `JK`

### 9.5 Also built
| Name | What | Stack | Status |
|---|---|---|---|
| Smart-X Gateway | IoT telemetry ingestion and validation, from a practice brief I wrote myself | .NET · React · Vite | Lab |
| Durban Leak Tracker | A city-wide way to report and track water leaks | Planning | Concept |
| Data structures in C# | Stack, queue, priority queue, hash table and tree written from scratch, each driving a small app | C# · .NET · WPF | Coursework |

### 9.6 CV teaser
- Title: `CV`
- Line: Education, projects and skills on one page, ready to read.
- Rows: Computer Science / 2026 · BCom in Marketing / First degree · Google IT Support certificate / Google · Team lead on three builds / 2026

### 9.7 Contact
- Title: `LET'S TALK`
- Copy: Need a backend built, a pipeline set up, or a team that needs a lead? I'm in Durban on South African time, and I'd like to hear about it.
- Links: `TODO(kai): email, LinkedIn, GitHub (personal account)`

### 9.8 CV (`/cv`)
- **Header:** Kaiyur Khedun · Backend Developer · Durban, South Africa · `TODO(kai): contact line`
- **Profile:** Backend developer with a BCom in Marketing and a degree in Computer Science (2026). I build APIs, database schemas and CI/CD pipelines, and this year I led a four-person team through three full builds, including an ordering, booking and shop platform for a Durban restaurant. I like systems that behave in production: business rules enforced in the database, and every change through a reviewed pull request and a green pipeline.
- **Projects:**
  - **Capri Pizza Kitchen**, Jun – Nov 2026. Backend lead and team lead · client project
    - Built the full backend for food ordering, pool-table bookings and a pro shop, shared by a website, an iOS and Android app and an owner dashboard.
    - Designed a hybrid schema: PostgreSQL (13 tables) for prices, bookings and stock; Firestore (4 collections) for carts, live order tracking and audit logs.
    - Enforced business rules in the database with an exclusion constraint against double bookings, conditional stock updates against overselling, and row-level security.
    - Set up CI/CD on GitHub Actions with pull-request review and required checks, deploying to Vercel and Expo EAS.
  - **CURBSIDE**, 2026. Team lead · Android game prototype
    - Led a team of four from research to prototype on a car-spotting collection game.
    - Designed the catch mechanics maths, the REST API and the UML for a Kotlin (Ktor) server on Azure.
  - **HustleHub+**, 2026. Team lead · secure web platform
    - Freelance marketplace on Node.js, Express, React and MongoDB, built in three increments: secure backend, full-stack app, then DevSecOps and monitoring.
  - **DailyClicker**, 2026. Solo · personal tool
    - Daily dashboard that opens on PC startup with tasks, goals, a quote and an inbox scan; installable on iPhone and works offline.
- **Education:** Computer Science, The IIE, South Africa · 2026 · BCom in Marketing, first degree (`TODO(kai)`)
- **Certificate:** IT Support Professional Certificate, Google
- **Skills:** Backend: C#, .NET, ASP.NET Core, Node.js, Express, Kotlin (Ktor) · Data: PostgreSQL, Supabase, Firestore, MongoDB · Frontend: React, Next.js, Expo / React Native, WPF · DevOps: GitHub Actions, Vercel, Azure, Expo EAS, Git workflow · Design: REST APIs, UML, data structures in C#
- **Also:** Tutor other students and build setup kits to get them coding.

---

## 10. Effects: used and deliberately not used

Used: **Card Arc Carousel** (work), **line-by-line reveal** (about, carousel title), the **pinned intro** (LED icon → spiral). That's all of them.
Not used, on purpose: layered parallax, sideways text, stacking cards, 3D card zoom, focus-frame slider, extra pinned headings. Don't add more effects without asking Kai.

---

## 11. Accessibility, reduced motion, performance

- Semantic headings (one `h1` per page), a skip link, visible focus (`2px solid var(--hot)`, offset 3px), and alt text or `aria-hidden` on every visual. The WebGL canvas is `aria-hidden`.
- **Reduced motion:** no loader, no Lenis, no scramble, no line reveals, intro not pinned (static coil frame), carousel shown as a list, no auto-rotation.
- Lighthouse targets on the deployed build: Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95, Performance ≥ 80 on mobile.
- No layout shift from fonts (`next/font` with fallbacks). The intro component and GSAP load after first paint.
- No horizontal overflow at 360, 390, 768, 1024, 1280 and 1920px widths.

---

## 12. Build phases

Work through these in order. After each phase: build and lint pass, commit, and post a short summary (what's done, what's `TODO(kai)`). **Pause for Kai's review after Phase 1 and Phase 2.** Otherwise keep going.

| Phase | Scope | Done when |
|---|---|---|
| 0 | Inspect the root, scaffold Next.js + TypeScript + Tailwind in place (don't nest a second folder), add GSAP and Lenis, set up tokens and fonts, create `TODO-KAI.md` | `npm run dev` shows a styled blank page |
| 1 | All sections and pages built **static**: content files, SheetHead, nav, About, a static work grid, Also built, CV teaser, Contact, `/work/[slug]` (6 pages with ported diagrams), `/cv` with print CSS, 404, metadata | The whole site is readable and navigable with no motion. Deployable MVP |
| 2 | **Card Arc Carousel** to the spec in section 7, including ruler, numeral, controls, keyboard, live region and fallbacks | Smooth, snaps exactly, 60fps, works on phone sizes |
| 3 | Loader + WebGL intro ported from the prototype, nav state, scramble | Matches the prototype's behaviour; reduced-motion path works |
| 4 | Lenis, line reveals, hover polish, View Transitions (optional), OG image, favicon, sitemap | Everything in section 11 passes |
| 5 | QA: the checklist below, a Lighthouse run, and a short Playwright smoke test (home loads, carousel reaches card 6, `/cv` renders, no overflow at 390px). Ask Kai before deploying to Vercel | Kai approves |

---

## 13. Acceptance checklist

- [ ] Loader shows LOADING plus the bar, then the LED coil boots in the dome grid, and scrolling twists it into the moving spiral
- [ ] Carousel: 6 cards on an arc, scroll rotates, snaps to each card, prev/next/keyboard work, clicking opens the case page
- [ ] Every fact on the site appears in the copy deck. Nothing invented. Every gap is listed in `TODO-KAI.md`
- [ ] `/cv` reads well on a phone and prints cleanly to A4
- [ ] Reduced motion: the site is fully usable with zero animation
- [ ] No horizontal scroll at any width; no console errors
- [ ] Builds and lints clean; committed; not pushed or deployed without Kai's go-ahead

---

## 14. Open items for Kai (`TODO-KAI.md` starts with these)

1. Capri live site URL (and repo links, if public)
2. Email, LinkedIn, GitHub (which personal account?)
3. BCom institution and year; Google IT Support certificate year
4. DailyClicker vs DailyLicker: the final name
5. Optional: a front-facing photo for the LED intro (replaces the coil)
6. Screenshots for card covers (`public/work/<slug>/cover.webp`)
7. Optional: the CV as a PDF for a download button
8. Domain name, and the GitHub account for the repo
