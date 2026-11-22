import type { Metadata, Viewport } from "next";
import { Fraunces, Zen_Maru_Gothic } from "next/font/google";
import { ArrowDefs } from "@/components/Diagram";
import { Nav } from "@/components/Nav";
import { SmoothScroll } from "@/components/SmoothScroll";
import { profile } from "@/content/profile";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], style: ["normal", "italic"] });
const zen = Zen_Maru_Gothic({ variable: "--font-zen", subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  // TODO(kai): domain for metadataBase (needed for absolute social-preview URLs).
  title: { default: "Kaiyur Khedun · Backend Developer", template: "%s · Kaiyur Khedun" },
  description: profile.tagline,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6efe3" },
    { media: "(prefers-color-scheme: dark)", color: "#111930" },
  ],
  viewportFit: "cover",
};

// Runs before first paint. Sets the theme (saved choice, else the system setting) so there's no flash, and on
// a hard load of the home page with motion allowed and no #section, turns on the intro: `js-loading` holds
// the veil, `intro-text` lets the hero text in. The timeout frees the page at 6.5s even if the app never runs.
const BOOT = `(function(){var d=document.documentElement,t;d.classList.add("js");
try{t=localStorage.getItem("theme")}catch(e){}
if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
d.dataset.theme=t;
if(matchMedia("(prefers-reduced-motion: reduce)").matches||location.pathname!=="/"||location.hash)return;
d.classList.add("intro","js-loading");try{history.scrollRestoration="manual"}catch(e){}
setTimeout(function(){d.classList.remove("js-loading");d.classList.add("intro-text")},6500)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${zen.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        <ArrowDefs />
        <div className="sky-bg" aria-hidden="true" />
        <Nav />
        <main id="main">{children}</main>
        <footer className="foot">
          <div className="wrap foot-in">
            <span>
              © 2026 {profile.name} · {profile.location}
            </span>
            <span>{profile.coords}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
