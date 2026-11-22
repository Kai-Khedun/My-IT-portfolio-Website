"use client";
// The fixed 3D world behind the home page, plus the veil it fades in from. Scroll position drives the car:
// hero → About is the drive into the valley, Work parks on the hilltop lookout (the ring turns the view),
// then the road runs down to the sea for Contact. The <head> script in app/layout.tsx decides before first
// paint whether the intro plays (hard load of "/", motion allowed, no #section).
import { useEffect, useRef } from "react";
import { journey } from "@/lib/journey";
import { lockScroll } from "@/lib/motion";
import type { World as WorldApi } from "./scene";

// Piecewise-linear lookup: points are [scrollY, value], sorted by scrollY.
function along(y: number, pts: [number, number][]) {
  if (y <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [x1, v1] = pts[i];
    if (y <= x1) {
      const [x0, v0] = pts[i - 1];
      return x1 === x0 ? v1 : v0 + ((v1 - v0) * (y - x0)) / (x1 - x0);
    }
  }
  return pts[pts.length - 1][1];
}

// Start fetching the 3D scene as soon as this module loads in the browser, instead of waiting for React to
// finish hydrating, so the world is usually ready before the veil gives up and the intro can play.
const scene = typeof window === "undefined" ? null : import("./scene");

export function World() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = innerWidth < 760 || matchMedia("(pointer: coarse)").matches;
    const intro = root.classList.contains("js-loading");
    let world: WorldApi | null = null;
    let alive = true;
    let D_HILL = 150, D_END = 326;
    const a = { pinStart: 0, pinEnd: 0, contact: 0, max: 1, vh: 1 };

    const finishLoading = () => {
      root.classList.remove("js-loading");
      lockScroll(false);
    };
    const showText = () => root.classList.add("intro-text");
    const failed = () => {
      root.classList.add("no-gl");
      finishLoading();
      showText();
    };
    if (intro) {
      lockScroll(true);
      scrollTo({ top: 0, behavior: "instant" });
    }
    // Slow device or connection: don't hold the veil forever. After ~4s show the page over the painted sky and
    // let the world fade in behind it when it's ready (without the descent).
    const veilCap = window.setTimeout(() => {
      finishLoading();
      showText();
    }, Math.max(0, 4000 - performance.now()));

    const measure = () => {
      const top = (id: string) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + scrollY : 0;
      };
      a.vh = innerHeight;
      a.max = Math.max(1, document.documentElement.scrollHeight - a.vh);
      const work = document.getElementById("work");
      a.pinStart = top("work");
      a.pinEnd = a.pinStart + Math.max(0, (work?.offsetHeight ?? 0) - a.vh);
      a.contact = Math.min(top("contact"), a.max);
    };
    const drive = () => {
      if (!world) return;
      const { pinStart, pinEnd, contact, max, vh } = a;
      const y = scrollY;
      const t = world.target;
      t.d = along(y, [
        [0, 0],
        [pinStart, D_HILL],
        [pinEnd, D_HILL],
        [Math.max(pinEnd + 1, contact - vh * 0.15), D_END],
      ]);
      t.hill = along(y, [
        [pinStart - vh * 0.9, 0],
        [pinStart, 1],
        [pinEnd, 1],
        [pinEnd + vh * 0.7, 0],
      ]);
      t.sea = along(y, [
        [Math.max(pinEnd + vh, contact - vh * 1.1), 0],
        [Math.max(pinEnd + vh + 1, max), 1],
      ]);
      t.night = root.dataset.theme === "dark" ? 1 : 0;
      world.redraw();
    };

    let queued = 0;
    const onScroll = () => {
      if (!queued)
        queued = requestAnimationFrame(() => {
          queued = 0;
          drive();
        });
    };
    const onResize = () => {
      measure();
      world?.resize();
      drive();
    };
    const themeObs = new MutationObserver(drive);
    themeObs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    (scene ?? import("./scene"))
      .then(async ({ createWorld, D_HILL: dh, D_END: de }) => {
        if (!alive) return;
        D_HILL = dh;
        D_END = de;
        const w = await createWorld(canvasRef.current!, {
          mobile,
          reduced,
          yaw: () => journey.yaw,
          onReady: () => {
            clearTimeout(veilCap);
            root.classList.add("gl-on");
            finishLoading();
          },
        });
        if (!alive) return w?.dispose();
        if (!w) return failed();
        world = w;
        measure();
        drive();
        // The descent only plays if the veil is still up; after the slow-device cap the text is already showing.
        if (intro && !root.classList.contains("intro-text")) {
          let seen = false;
          try {
            seen = sessionStorage.getItem("kk-intro") === "1";
            sessionStorage.setItem("kk-intro", "1");
            history.scrollRestoration = "auto";
          } catch {}
          world.playIntro(seen ? 1900 : 3600, showText);
        }
      })
      .catch(failed);

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    // Layout settles after fonts and the pinned ring are measured.
    const settle = window.setTimeout(onResize, 600);
    document.fonts?.ready.then(() => alive && onResize());

    return () => {
      alive = false;
      clearTimeout(veilCap);
      clearTimeout(settle);
      cancelAnimationFrame(queued);
      themeObs.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      world?.dispose();
      root.classList.remove("gl-on");
      lockScroll(false);
    };
  }, []);

  return (
    <>
      <div className="veil" aria-hidden="true">
        <span className="veil-spark">✦</span>
      </div>
      <canvas className="world" ref={canvasRef} aria-hidden="true" />
    </>
  );
}
