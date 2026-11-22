"use client";
// Line-by-line reveal (brief §6) for elements marked data-reveal: each line slides up out of a mask once,
// when it scrolls into view. Re-splits on resize. Text is fully visible without JS or with reduced motion.
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP } from "@/lib/motion";

gsap.registerPlugin(SplitText);

export function LineReveals() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const splits = gsap.utils.toArray<HTMLElement>("[data-reveal]").map((el) =>
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "rl",
          aria: "none",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 0.9,
              stagger: 0.08,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }),
        }),
      );
      return () => splits.forEach((s) => s.revert());
    });
  });
  return null;
}
