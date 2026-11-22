import type { Metadata, Viewport } from "next";
import { Doto, Instrument_Sans, Martian_Mono } from "next/font/google";
import { ArrowDefs } from "@/components/Diagram";
import { Nav } from "@/components/Nav";
import { SmoothScroll } from "@/components/SmoothScroll";
import { profile } from "@/content/profile";
import "./globals.css";

const doto = Doto({ variable: "--font-doto", subsets: ["latin"] });
const instrument = Instrument_Sans({ variable: "--font-instrument", subsets: ["latin"] });
const martian = Martian_Mono({ variable: "--font-martian", subsets: ["latin"], axes: ["wdth"] });

export const metadata: Metadata = {
  // TODO(kai): domain for metadataBase (needed for absolute social-preview URLs).
  title: { default: "Kaiyur Khedun · Backend Developer", template: "%s · Kaiyur Khedun" },
  description: profile.tagline,
};

export const viewport: Viewport = {
  themeColor: "#05070b",
  colorScheme: "dark",
  viewportFit: "cover",
};

// Runs before first paint. `js` turns on the pinned intro; `intro` + `js-loading` show the loader, only on a
// hard load of the home page with motion allowed and no #section in the URL (brief §5.1). The timeout is the
// failsafe that frees the page at 6.5s even if the app bundle never runs.
const BOOT = `(function(){var d=document.documentElement;d.classList.add("js");
if(matchMedia("(prefers-reduced-motion: reduce)").matches||location.pathname!=="/"||location.hash)return;
d.classList.add("intro","js-loading");try{history.scrollRestoration="manual"}catch(e){}
setTimeout(function(){d.classList.remove("js-loading")},6500)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${doto.variable} ${instrument.variable} ${martian.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        <ArrowDefs />
        <div className="bg-fallback" aria-hidden="true" />
        <Nav />
        <main id="main">{children}</main>
        <footer className="foot">
          <div className="wrap foot-in mono">
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
