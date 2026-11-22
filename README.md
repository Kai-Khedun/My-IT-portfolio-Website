# Kaiyur Khedun · portfolio

Next.js (App Router) + TypeScript + Tailwind CSS, with GSAP and Lenis for motion.
The spec is `PORTFOLIO_BRIEF.md`; the old static site lives in `legacy/`.

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

## Edit content

All copy lives in `content/`: `profile.ts` (intro, about, contact), `projects.ts` (the six work cards and case pages) and `cv.ts`.
Anything still missing is marked `TODO(kai)` in code and listed in `TODO-KAI.md`.

## Deploy

Vercel picks up Next.js with no extra config. Security headers are set in `next.config.ts`.
Import the repo in Vercel (or run `npx vercel` from this folder) and deploy the `main` branch once the `redesign` branch is merged.
