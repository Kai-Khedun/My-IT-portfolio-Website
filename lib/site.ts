// The site's public address. On Vercel it comes from the project's production domain automatically;
// locally it's the dev server. TODO(kai): add your custom domain in Vercel (or set NEXT_PUBLIC_SITE_URL).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
