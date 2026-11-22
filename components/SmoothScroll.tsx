"use client";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { gsap, ScrollTrigger, setLenis } from "@/lib/motion";

/** Lenis driven from GSAP's ticker so ScrollTrigger and smooth scroll share one clock. Off for reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: false });
    const tick = (t: number) => lenis.raf(t * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);
    // A #section in the URL on load: the browser jumped there before the carousel pin added its scroll
    // length, so measure the pins and jump again.
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target) {
      ScrollTrigger.refresh();
      lenis.scrollTo(target, { immediate: true, force: true });
    }
    return () => {
      setLenis(null);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}
