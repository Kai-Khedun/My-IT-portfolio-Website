import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

export const EASE_OUT = "expo.out"; // ≈ cubic-bezier(.16,1,.3,1)

// The one Lenis instance, set by <SmoothScroll/>. Null with reduced motion.
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

/** Smooth scroll to a page offset: through Lenis when it's running, natively otherwise. */
export function scrollToY(y: number, duration = 0.9) {
  if (lenis) lenis.scrollTo(y, { duration });
  else window.scrollTo({ top: y, behavior: "smooth" });
}
