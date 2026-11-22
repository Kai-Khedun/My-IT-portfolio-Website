"use client";
// Sheet 01: loader + pinned intro (brief §5). The server HTML is the static frame (SVG coil and text). On the
// client this runs the LOADING bar, the scroll-driven text fade, the nav state, the scramble and the WebGL scene.
// The <head> script in app/layout.tsx decides before first paint whether the loader shows at all.
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Clock } from "@/components/Clock";
import { CoilMark } from "@/components/CoilMark";
import { profile } from "@/content/profile";
import { lockScroll } from "@/lib/motion";

/** Shared with the WebGL scene: hero geometry and when the loader finished. */
export type IntroState = { top: number; range: number; done: boolean; at: number };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*+=<>/";

/** Random characters resolving left to right into the element's data-text. */
function scramble(el: HTMLElement, dur: number) {
  const fin = el.dataset.text ?? "";
  const at = Array.from(fin, (_, i) => (i / fin.length) * 0.6 + Math.random() * 0.4);
  const t0 = performance.now();
  const step = (now: number) => {
    const t = (now - t0) / dur;
    let out = "";
    for (let i = 0; i < fin.length; i++) {
      const c = fin[i];
      out += c === " " || c === "." || c === "," || t >= at[i] ? c : CHARS[(Math.random() * CHARS.length) | 0];
    }
    el.textContent = out;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = fin;
  };
  requestAnimationFrame(step);
}

/** Real text for screen readers, an uppercase twin for the scramble. */
function Scramble({ text }: { text: string }) {
  const caps = text.toUpperCase();
  return (
    <>
      <span className="sr">{text}</span>
      <span aria-hidden="true" data-text={caps}>
        {caps}
      </span>
    </>
  );
}

export function Intro() {
  const heroRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const hero = heroRef.current!;
    const s: IntroState = { top: 0, range: 1, done: false, at: -1e9 };
    const timers: number[] = [];
    let alive = true;
    let fontsReady = false;
    let glReady = false;
    let stopScene: (() => void) | undefined;

    const layout = () => {
      const r = hero.getBoundingClientRect();
      s.top = r.top + scrollY;
      s.range = Math.max(1, r.height - innerHeight);
    };
    // Text fades and lifts as the hero scrolls (CSS reads --hp); nav turns solid as the stage unpins.
    const paint = () => {
      hero.style.setProperty("--hp", clamp01((scrollY - s.top) / s.range).toFixed(4));
      root.classList.toggle("at-hero", scrollY <= s.top + s.range - 40);
    };
    layout();
    paint();

    const finish = () => {
      if (s.done) return;
      s.done = true;
      s.at = performance.now();
      root.classList.remove("js-loading");
      lockScroll(false);
      try {
        sessionStorage.setItem("kk-intro", "1");
        history.scrollRestoration = "auto";
      } catch {}
      hero.querySelectorAll<HTMLElement>("[data-text]").forEach((el, i) => {
        timers.push(window.setTimeout(() => scramble(el, 850 + i * 250), 300 + i * 160));
      });
    };

    if (!root.classList.contains("js-loading")) s.done = true;
    else {
      // Times run from navigation start, so the bar and failsafe match the CSS one (6.5s) in the <head> script.
      lockScroll(true);
      scrollTo({ top: 0, behavior: "instant" });
      timers.push(window.setTimeout(finish, Math.max(0, 5600 - performance.now())));
      let seen = false;
      try {
        seen = sessionStorage.getItem("kk-intro") === "1";
      } catch {}
      const minDur = seen ? 800 : 1900;
      let shown = 0, last = performance.now(), held = 0;
      const tick = (now: number) => {
        if (s.done || !alive) return;
        const dt = Math.min(64, now - last);
        last = now;
        // Holds at 86% until fonts and the scene are ready.
        const target = Math.min(clamp01(now / minDur), fontsReady && glReady ? 1 : 0.86);
        if (target > shown) shown = Math.min(target, shown + dt / (minDur * 0.5));
        barRef.current?.style.setProperty("--lp", `${(shown * 100).toFixed(1)}%`);
        if (shown >= 1) {
          if (!held) held = now;
          if (now - held > 240) return finish();
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    const onFonts = () => {
      if (fontsReady || !alive) return;
      fontsReady = true;
      layout();
      paint();
    };
    const name = hero.querySelector("#name")!;
    document.fonts.load(`800 40px ${getComputedStyle(name).fontFamily}`).then(() => document.fonts.ready).then(onFonts, onFonts);
    timers.push(window.setTimeout(onFonts, 2600));

    // Scene: loaded after first paint, never for reduced motion (the SVG coil stays as the static frame).
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) glReady = true;
    else
      import("./scene").then(
        ({ startScene }) => {
          if (alive) stopScene = startScene(canvasRef.current!, s, () => (glReady = true));
        },
        () => (glReady = true),
      );

    let queued = 0;
    const onScroll = () => {
      if (!queued)
        queued = requestAnimationFrame(() => {
          queued = 0;
          paint();
        });
    };
    const onResize = () => {
      layout();
      paint();
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(queued);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      stopScene?.();
      root.classList.remove("at-hero");
      // js-loading is left alone: a dev remount carries the loader on, and the <head> failsafe clears it anyway.
      lockScroll(false);
    };
  }, []);

  return (
    <>
      <div className="loader" aria-hidden="true">
        <div className="load-box">
          <p className="load-word">LOADING</p>
          <div className="load-bar" ref={barRef}>
            <i />
          </div>
        </div>
      </div>
      <canvas className="gl" ref={canvasRef} aria-hidden="true" />

      <section className="hero" id="top" ref={heroRef} aria-labelledby="name">
        <div className="pin">
          <CoilMark className="hero-mark" />
          <div className="wrap pin-in">
            <div className="h-left">
              <h1 id="name">
                <Scramble text={profile.name} />
              </h1>
              <p className="mono h-sub">
                <span>{"// Portfolio"}</span>
                <span>2026</span>
              </p>
            </div>
            <p className="h-right">
              <Scramble text={profile.tagline} />
            </p>
            <div className="h-foot mono">
              <span className="loc">
                Durban · <Clock /> SAST
              </span>
              <span className="cue">
                Scroll <i aria-hidden="true" />
              </span>
              <Link href="/cv">Read my CV ↗</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
