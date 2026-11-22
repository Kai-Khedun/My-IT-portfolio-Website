"use client";
// Card Arc Carousel (brief §7). Server HTML is a plain card grid; this upgrades it to the pinned wheel
// unless the visitor prefers reduced motion. Per frame only transform/opacity/visibility are written.
import { useRef, useState, type ReactNode } from "react";
import { SheetHead } from "@/components/SheetHead";
import { gsap, ScrollTrigger, scrollToY, useGSAP } from "@/lib/motion";

const pad = (n: number) => String(n).padStart(2, "0");
const DEG = 180 / Math.PI;
const fmtDeg = (d: number) => (d === 0 ? "0°" : `${d > 0 ? "+" : "−"}${Math.abs(d)}°`);

export function ArcCarousel({ titles, cards }: { titles: string[]; cards: ReactNode[] }) {
  const n = cards.length;
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [said, setSaid] = useState("");
  // Ruler ticks every STEP/5, from one card before the first to one after the last.
  const ticks = Array.from({ length: 5 * n + 6 }, (_, j) => j - 5);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        el.classList.add("arc-on");
        const items = gsap.utils.toArray<HTMLElement>(".arc-item", el);
        const ruler = el.querySelector<HTMLElement>(".arc-ruler")!;
        const tickEls = gsap.utils.toArray<HTMLElement>(".arc-tick", el);
        const labels = gsap.utils.toArray<HTMLElement>(".arc-deg", el);
        const proxy = { p: 0 };
        const geo = { step: 0.2, R: 1200 };
        const degs: number[] = [];
        let shown = 0; // index currently drawn as active
        let pending: number | null = null; // index a button/key/click is heading to
        let announced = 0;
        let settle = 0;

        // Geometry (§7.2). Runs on setup and on every ScrollTrigger refresh, never per frame.
        const measure = () => {
          const vw = document.documentElement.clientWidth;
          const vh = el.clientHeight;
          let cw: number, R: number;
          if (vw >= 1024) {
            cw = gsap.utils.clamp(300, 420, vw * 0.28);
            R = Math.max(1200, vw * 1.25);
          } else if (vw >= 640) {
            cw = vw * 0.46;
            R = vw * 1.6;
          } else {
            cw = vw * 0.76;
            R = vw * 2.1;
          }
          // ponytail: extra guard beyond the spec so a 4:5 card never tops 58% of a short screen.
          cw = Math.min(cw, vh * 0.58 * 0.8);
          const ch = cw * 1.25;
          // Ruler sits just below the cards (brief says R + 0.62·H, but a bigger radius would put it above them).
          const rr = R - ch * 0.62;
          geo.R = R;
          geo.step = (cw * 1.14) / R;
          el.style.setProperty("--card-w", `${cw}px`);
          el.style.setProperty("--pivot-y", `${vh * 0.52 + R}px`);
          el.style.setProperty("--rr", `${rr}px`);
          tickEls.forEach((t) => {
            t.style.transform = `rotate(${(Number(t.dataset.k) * geo.step) / 5}rad) translate(-50%, ${-rr}px)`;
          });
          labels.forEach((l, i) => {
            l.style.transform = `rotate(${i * geo.step}rad) translate(-50%, ${-rr + 18}px)`;
          });
          degs.length = 0;
        };

        const render = (p: number) => {
          const { step, R } = geo;
          items.forEach((it, i) => {
            const d = Math.abs(i - p);
            const dc = Math.min(d, 3);
            it.style.transform = `translate(-50%,-50%) rotate(${(i - p) * step}rad) translateY(${-R}px) scale(${1 - 0.1 * dc})`;
            it.style.opacity = String(1 - 0.28 * dc);
            it.style.visibility = d > 3.2 ? "hidden" : "";
          });
          ruler.style.transform = `rotate(${-p * step}rad)`;
          labels.forEach((l, i) => {
            const deg = Math.round((i - p) * step * DEG);
            if (degs[i] !== deg) {
              degs[i] = deg;
              l.textContent = fmtDeg(deg);
            }
          });
          const a = Math.round(p);
          if (a !== shown) {
            shown = a;
            setActive(a);
          }
          // Announce once the wheel has come to rest, not on every frame.
          clearTimeout(settle);
          settle = window.setTimeout(() => {
            pending = null;
            if (a !== announced) {
              announced = a;
              setSaid(`Project ${a + 1} of ${n}: ${titles[a]}`);
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
            end: () => `+=${(n - 1) * window.innerHeight * (window.innerWidth < 640 ? 0.55 : 0.75)}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            snap: { snapTo: 1 / (n - 1), duration: { min: 0.35, max: 0.6 }, ease: "power2.inOut", delay: 0.05 },
            onToggle: (self) => el.classList.toggle("is-pinned", self.isActive),
          },
        });
        const st = tween.scrollTrigger!;
        render(0);

        const goTo = (i: number) => {
          const to = gsap.utils.clamp(0, n - 1, i);
          pending = to;
          scrollToY(st.start + ((st.end - st.start) * to) / (n - 1));
        };
        const indexOf = (t: EventTarget | null) => {
          const li = (t as HTMLElement | null)?.closest?.(".arc-item");
          return li ? items.indexOf(li as HTMLElement) : -1;
        };

        const onClick = (e: MouseEvent) => {
          const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-go]");
          if (btn) return goTo((pending ?? shown) + Number(btn.dataset.go));
          const i = indexOf(e.target);
          // Non-active card: bring it to the top instead of opening it.
          if (i >= 0 && i !== shown) {
            e.preventDefault();
            goTo(i);
          }
        };
        // Tabbing to a card puts it in the active slot. Wait a frame: the browser's own
        // scroll-into-view for the focused link runs after focusin and would otherwise win.
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

        // Hover tilt on the active card (desktop, fine pointer only): up to 6° towards the cursor.
        const canTilt = matchMedia("(hover: hover) and (pointer: fine)").matches;
        const onMove = (e: PointerEvent) => {
          if (!canTilt || window.innerWidth < 1024) return;
          const card = (e.target as HTMLElement).closest<HTMLElement>(".arc-item.is-active .card");
          if (!card) return;
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          card.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
          card.style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
          card.style.setProperty("--mx", `${x * 100}%`);
          card.style.setProperty("--my", `${y * 100}%`);
        };
        const onLeave = (e: PointerEvent) => {
          const card = (e.target as HTMLElement).closest<HTMLElement>(".card");
          if (card && !card.contains(e.relatedTarget as Node)) card.removeAttribute("style");
        };

        const onRefreshInit = () => measure();
        const onRefresh = () => render(proxy.p);
        ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
        ScrollTrigger.addEventListener("refresh", onRefresh);
        el.addEventListener("click", onClick);
        el.addEventListener("focusin", onFocus);
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerout", onLeave);
        window.addEventListener("keydown", onKey);

        return () => {
          clearTimeout(settle);
          ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
          ScrollTrigger.removeEventListener("refresh", onRefresh);
          el.removeEventListener("click", onClick);
          el.removeEventListener("focusin", onFocus);
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerout", onLeave);
          window.removeEventListener("keydown", onKey);
          el.classList.remove("arc-on", "is-pinned");
          el.removeAttribute("style");
          [...items, ruler, ...tickEls, ...labels].forEach((x) => x.removeAttribute("style"));
          el.querySelectorAll(".card").forEach((c) => c.removeAttribute("style"));
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="arc" aria-roledescription="carousel" aria-label="Selected work">
      <div className="wrap arc-head">
        <SheetHead left="03 · Selected work" right="Sheet 03 of 05" />
        <h2 className="sec-title work-title" id="work-title">
          Selected work
        </h2>
      </div>

      <div className="arc-num arc-only" aria-hidden="true">
        {cards.map((_, i) => (
          <span key={i} className={i === active ? "on" : undefined}>
            {pad(i + 1)}
          </span>
        ))}
      </div>
      <div className="arc-line arc-only" aria-hidden="true" />
      <div className="arc-ruler arc-only" aria-hidden="true">
        {ticks.map((k) => (
          <i key={k} data-k={k} className={k % 5 === 0 && k >= 0 && k < 5 * n ? "arc-tick major" : "arc-tick"} />
        ))}
        {cards.map((_, i) => (
          <span key={i} className={i === active ? "arc-deg on" : "arc-deg"} />
        ))}
      </div>
      <div className="arc-zero arc-only" aria-hidden="true" />

      <ul className="wrap work-grid arc-list">
        {cards.map((card, i) => (
          <li
            key={i}
            className={i === active ? "arc-item is-active" : "arc-item"}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}`}
          >
            {card}
          </li>
        ))}
      </ul>

      <div className="wrap arc-controls arc-only">
        <button type="button" className="pill" data-go="-1" aria-disabled={active === 0}>
          <span aria-hidden="true">←</span> Prev
        </button>
        <p className="mono arc-status">
          <span className="arc-count">
            {pad(active + 1)} / {pad(n)}
          </span>
          <span className="arc-title">
            <span key={active}>{titles[active]}</span>
          </span>
        </p>
        <button type="button" className="pill" data-go="1" aria-disabled={active === n - 1}>
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="sr" aria-live="polite">
        {said}
      </p>
    </section>
  );
}
