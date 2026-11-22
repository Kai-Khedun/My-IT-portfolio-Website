"use client";
// Project ring: you stand in the middle and the cards orbit around you as you scroll. The section pins,
// scroll turns the ring one card at a time (with snapping), and the 3D world behind turns by the same angle.
// Server HTML is a plain card list; reduced motion keeps it that way.
import { useRef, useState, type ReactNode } from "react";
import { journey } from "@/lib/journey";
import { gsap, ScrollTrigger, scrollToY, useGSAP } from "@/lib/motion";

const pad = (n: number) => String(n).padStart(2, "0");
const STEP = 40; // degrees between cards around the ring

export function ProjectRing({ titles, cards, head }: { titles: string[]; cards: ReactNode[]; head: ReactNode }) {
  const n = cards.length;
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [said, setSaid] = useState("");

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        el.classList.add("orbit-on");
        const items = gsap.utils.toArray<HTMLElement>(".orbit-item", el);
        const proxy = { p: 0 };
        let persp = 600;
        let shown = 0;
        let pending: number | null = null;
        let announced = 0;
        let settle = 0;

        const measure = () => {
          const vw = document.documentElement.clientWidth;
          const vh = el.clientHeight;
          let w = vw >= 1024 ? gsap.utils.clamp(300, 400, vw * 0.25) : vw >= 640 ? vw * 0.44 : vw * 0.74;
          w = Math.min(w, vh * 0.5); // card is ~1.3× as tall as wide; keep it clear of the heading
          persp = w * 1.55;
          el.style.setProperty("--w", `${w}px`);
          el.style.setProperty("--persp", `${persp}px`);
        };

        const render = (p: number) => {
          const turn = p * STEP;
          items.forEach((it, i) => {
            const phi = turn - i * STEP; // card 1 sits to the right and swings to the front
            const a = Math.abs(phi);
            it.style.transform = `translate(-50%,-50%) rotateY(${phi}deg) translateZ(${-persp}px)`;
            it.style.opacity = String(Math.min(1, Math.max(0, (78 - a) / 22)));
            it.style.visibility = a > 78 ? "hidden" : "";
          });
          journey.yaw = (turn * Math.PI) / 180;
          const i = Math.round(p);
          if (i !== shown) {
            shown = i;
            setActive(i);
          }
          clearTimeout(settle);
          settle = window.setTimeout(() => {
            pending = null;
            if (i !== announced) {
              announced = i;
              setSaid(`Project ${i + 1} of ${n}: ${titles[i]}`);
            }
          }, 350);
        };

        measure();
        const tween = gsap.to(proxy, {
          p: n - 1,
          ease: "none",
          onUpdate: () => render(proxy.p),
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${(n - 1) * window.innerHeight * (window.innerWidth < 640 ? 0.6 : 0.8)}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            snap: { snapTo: 1 / (n - 1), duration: { min: 0.35, max: 0.7 }, ease: "power2.inOut", delay: 0.05 },
          },
        });
        const st = tween.scrollTrigger!;
        render(0);

        const goTo = (i: number) => {
          const to = gsap.utils.clamp(0, n - 1, i);
          pending = to;
          scrollToY(st.start + ((st.end - st.start) * to) / (n - 1), 1.1);
        };
        const indexOf = (t: EventTarget | null) => {
          const li = (t as HTMLElement | null)?.closest?.(".orbit-item");
          return li ? items.indexOf(li as HTMLElement) : -1;
        };
        const onClick = (e: MouseEvent) => {
          const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-go]");
          if (btn) return goTo((pending ?? shown) + Number(btn.dataset.go));
          const i = indexOf(e.target);
          if (i >= 0 && i !== shown) {
            e.preventDefault(); // a side card turns to the front instead of opening
            goTo(i);
          }
        };
        const onFocus = (e: FocusEvent) => {
          const i = indexOf(e.target);
          if (i >= 0) requestAnimationFrame(() => goTo(i));
        };
        const onKey = (e: KeyboardEvent) => {
          if (e.altKey || e.ctrlKey || e.metaKey || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
          if (!ScrollTrigger.isInViewport(el, 0.6)) return;
          e.preventDefault();
          goTo((pending ?? shown) + (e.key === "ArrowRight" ? 1 : -1));
        };
        const onRefreshInit = () => measure();
        const onRefresh = () => render(proxy.p);
        ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
        ScrollTrigger.addEventListener("refresh", onRefresh);
        el.addEventListener("click", onClick);
        el.addEventListener("focusin", onFocus);
        window.addEventListener("keydown", onKey);

        return () => {
          clearTimeout(settle);
          journey.yaw = 0;
          ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
          ScrollTrigger.removeEventListener("refresh", onRefresh);
          el.removeEventListener("click", onClick);
          el.removeEventListener("focusin", onFocus);
          window.removeEventListener("keydown", onKey);
          el.classList.remove("orbit-on");
          el.removeAttribute("style");
          items.forEach((x) => x.removeAttribute("style"));
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="orbit" role="region" aria-roledescription="carousel" aria-label="Selected work">
      <div className="wrap orbit-head">{head}</div>
      <div className="orbit-view">
        <ul className="orbit-list">
          {cards.map((card, i) => (
            <li key={i} className={i === active ? "orbit-item is-active" : "orbit-item"} aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
              {card}
            </li>
          ))}
        </ul>
      </div>
      <div className="wrap orbit-controls orbit-only">
        <button type="button" className="pill" data-go="-1" aria-disabled={active === 0}>
          <span aria-hidden="true">←</span> Prev
        </button>
        <p className="orbit-status">
          <span className="orbit-count">
            {pad(active + 1)} <span aria-hidden="true">/</span> {pad(n)}
          </span>
          <span className="orbit-title" key={active}>
            {titles[active]}
          </span>
        </p>
        <button type="button" className="pill" data-go="1" aria-disabled={active === n - 1}>
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="sr" aria-live="polite">
        {said}
      </p>
    </div>
  );
}
