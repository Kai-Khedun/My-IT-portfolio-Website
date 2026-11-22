import type { Metadata, Viewport } from "next";
import { Doto, Instrument_Sans, Martian_Mono } from "next/font/google";
import "./globals.css";

const doto = Doto({ variable: "--font-doto", subsets: ["latin"] });
const instrument = Instrument_Sans({ variable: "--font-instrument", subsets: ["latin"] });
const martian = Martian_Mono({ variable: "--font-martian", subsets: ["latin"], axes: ["wdth"] });

export const metadata: Metadata = {
  title: "Kaiyur Khedun · Backend Developer",
  description:
    "Backend developer from Durban. I build the APIs, databases and pipelines behind the app.",
};

export const viewport: Viewport = {
  themeColor: "#05070b",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${doto.variable} ${instrument.variable} ${martian.variable}`}>
      <body>{children}</body>
    </html>
  );
}
