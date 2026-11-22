# Kaiyur Khedun · portfolio

Next.js (App Router) + TypeScript + Tailwind CSS, with three.js for the 3D world and GSAP + Lenis for scroll.
The spec is `PORTFOLIO_BRIEF.md` (its content rules still apply; the look was redesigned on Kai's request: a soft summer road trip with day and night modes). The old static site lives in `legacy/`.

## Where things live

- `components/World/scene.ts`: the 3D valley, road, car, clouds, lighthouse and day/night palette. Everything is generated in code; no models or textures.
- `components/World/World.tsx`: maps scroll position to the drive (meadow → hilltop → sea) and runs the intro.
- `components/Ring/`: the project ring that orbits around you, the cards and their painted covers.
- `app/globals.css`: all tokens (`:root` for day, `[data-theme="dark"]` for night) and styles.

## Run

```powershell
npm install
npm run dev
```

Open http://localhost:3000.

## Check and build

```powershell
npm run lint
npm run build
npm start
```

## Test

```powershell
npm run test:e2e
```

Builds the site, serves it on port 3100 and runs the smoke test (`tests/smoke.spec.ts`) in your installed Microsoft Edge: home loads, the project ring reaches card 6, `/cv` renders, nothing scrolls sideways at 390px, and reduced motion shows plain content.

## Edit content

All copy lives in `content/`: `profile.ts` (intro, about, contact), `projects.ts` (the six work cards and case pages) and `cv.ts`.
Anything still missing is marked `TODO(kai)` in code and listed in `TODO-KAI.md`.

## Deploy

Vercel picks up Next.js with no extra config. Security headers are set in `next.config.ts`.
Import the repo in Vercel (or run `npx vercel` from this folder) and deploy the `main` branch once the `redesign` branch is merged.
