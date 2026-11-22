# What I still need from Kai

Each item is also marked `TODO(kai)` in code. Until it's filled in, the site shows nothing (or a neutral fallback) in its place.

1. **Capri live site URL** (and repo links, if public). `content/projects.ts` → `capri.links`. Shown prominently on the Capri page once added.
2. **Email and LinkedIn.** `content/profile.ts` → `contact`. GitHub (`github.com/Kai-Khedun`) is already in.
3. **BCom institution and year; Google IT Support certificate year.** `content/profile.ts` → `qualifications`, `content/cv.ts` → `education`.
4. **Exact name of the Computer Science degree.** The old site's meta description says "BCAD"; not used until you confirm.
5. **DailyClicker vs DailyLicker:** which is the final name? The site says DailyClicker for now.
6. *Optional:* a front-facing photo for the LED intro (replaces the coil). Drop it in `public/` and set `PORTRAIT` in `components/Intro/scene.ts`.
7. **Screenshots for card covers**: `public/work/<slug>/cover.webp`. Until then, covers show the project diagram (or a monogram).
8. *Optional:* the CV as a PDF (`public/cv/Kaiyur-Khedun-CV.pdf`). The Download button appears on `/cv` once the file exists.
9. **Domain name**, and whether to reuse the existing Vercel project. Needed for `metadataBase`, the sitemap and social previews.
10. Keep or delete `legacy/` (the old Berserk site) once the new one is live?
11. **Tetherfall: what did you build?** The "What I built" list is left out until you fill it in.
12. **CV contact line** (email / phone / links you want printed on the CV header).
