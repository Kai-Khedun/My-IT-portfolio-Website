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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${doto.variable} ${instrument.variable} ${martian.variable}`}>
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
