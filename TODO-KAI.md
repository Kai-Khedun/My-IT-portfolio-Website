# What I still need from Kai

Each item is also marked `TODO(kai)` in code. Until it's filled in, the site shows nothing (or a neutral fallback) in its place.

1. **Capri live site URL** (and repo links, if public). `content/projects.ts` → `capri.links`. Shown prominently on the Capri page once added.
2. **Email and LinkedIn.** `content/profile.ts` → `contact`. GitHub (`github.com/Kai-Khedun`) is already in.
3. ~~BCom institution and year~~: done from your certificate (Bachelor of Commerce, Marketing Management, with distinction, The IIE, 2023). **Still needed: the year of your Google IT Support certificate, and the exact title and year of your Control4 certificate** (`content/cv.ts` → `certifications`).
4. ~~Exact name of the Computer Science degree~~: done from your IIE programme schedule (Bachelor of Computer and Information Science in Application Development, BCAD). Check the year (2026) matches your certificate when you get it.
5. **DailyClicker vs DailyLicker:** which is the final name? The site says DailyClicker for now.
6. ~~Optional photo for the intro~~: no longer needed. The new intro is the road-trip scene.
7. **Screenshots for project covers**: `public/work/<slug>/cover.webp`. Until then, each project shows its own painted-sky illustration.
8. ~~CV as a PDF~~: done. `public/cv/Kaiyur-Khedun-CV.pdf` is generated from `/cv`; after changing `content/cv.ts`, start the site and run `npm run cv:pdf`.
9. **Domain name**, and whether to reuse the existing Vercel project. On Vercel the site's address (social previews, sitemap) comes from the production domain automatically; add a custom domain there, or set `NEXT_PUBLIC_SITE_URL` (`lib/site.ts`).
10. Keep or delete `legacy/` (the old Berserk site) once the new one is live?
11. **Tetherfall: what did you build?** The "What I built" list is left out until you fill it in.
12. **CV contact details**: email (`content/profile.ts` → `contact.email`), optional phone (`content/cv.ts` → `phone`) and LinkedIn. They appear on the CV header and in the PDF once filled in.
13. **Languages:** the CV lists C#, Kotlin, JavaScript, TypeScript, SQL (PostgreSQL, PL/pgSQL), Luau, HTML, CSS and PowerShell (from your projects and GitHub). Add any others you've used (e.g. Python, Java).
14. *Optional:* the event or module where Capri won Best Design, Best Solution and Best Presentation, if you'd like it named.
