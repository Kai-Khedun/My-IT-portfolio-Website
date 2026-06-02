/* =========================================================
   PORTFOLIO — main.js
   GSAP + ScrollTrigger driven interactions.
   ========================================================= */

(function () {
  "use strict";

  // ---------- Wait for DOM ----------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    // Footer year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    setupCustomCursor();
    setupSplash();
    setupScrollReveals();
    setupBehelitEasterEgg();
    setupMagneticButtons();
  }

  /* =========================================================
     MAGNETIC BUTTONS — subtle pull toward cursor on hover
     ========================================================= */
  function setupMagneticButtons() {
    if (window.matchMedia("(hover: none)").matches) return;
    if (!window.gsap) return;

    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */
  function setupCustomCursor() {
    // Skip on touch devices
    if (window.matchMedia("(hover: none)").matches) return;

    const cursor = document.getElementById("cursor");
    const dot = document.getElementById("cursorDot");
    if (!cursor || !dot) return;

    document.body.classList.add("has-custom-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx, cy = my;
    let dx = mx, dy = my;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      document.body.classList.add("cursor-ready");
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      document.body.classList.remove("cursor-ready");
    });

    // Smooth follow
    function loop() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      dx += (mx - dx) * 0.4;
      dy += (my - dy) * 0.4;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) rotate(35deg)`;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    // Hover state on interactive elements
    const hoverables = "a, button, .skill, .project, .behelit, .splash__enter";
    document.querySelectorAll(hoverables).forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });
  }

  /* =========================================================
     SPLASH — Brand of Sacrifice ignition + reveal
     ========================================================= */
  function setupSplash() {
    const splash = document.getElementById("splash");
    const enterBtn = document.getElementById("enterBtn");
    if (!splash || !window.gsap) return;

    const tl = gsap.timeline();

    // 1) Brand strokes draw on
    tl.fromTo(
      ".brand__stroke",
      { strokeDashoffset: 600, opacity: 0 },
      { strokeDashoffset: 0, opacity: 1, duration: 1.4, ease: "power2.out", stagger: 0.12 }
    );
    // 2) Brand glow pulse
    tl.fromTo(
      ".brand__glow",
      { scale: 0.4, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" },
      "-=1.1"
    );
    // 3) Title and sub fade up
    tl.fromTo(
      ".splash__line",
      { y: 40, opacity: 0, letterSpacing: "0.6em" },
      { y: 0, opacity: 1, letterSpacing: "0.18em", duration: 1.1, ease: "power3.out" },
      "-=0.5"
    );
    tl.fromTo(
      ".splash__sub",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.6"
    );
    // 4) Enter button
    tl.fromTo(
      ".splash__enter",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" },
      "-=0.3"
    );
    // 5) Subtle brand pulse loop
    tl.to(".brand__glow", {
      scale: 1.06,
      opacity: 0.85,
      duration: 1.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    function exitSplash() {
      if (document.body.classList.contains("splash-done")) return;

      const exit = gsap.timeline({
        onComplete: () => {
          document.body.classList.add("splash-done");
          // Kick off hero reveal
          gsap.fromTo(
            "#hero [data-reveal]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out" }
          );
        }
      });

      // Crosshatch wipe up
      exit.to(".splash__wipe", {
        y: "0%",
        duration: 0.7,
        ease: "power3.inOut"
      });
      // Splash content out
      exit.to(".splash__inner", {
        opacity: 0,
        scale: 0.96,
        duration: 0.4,
        ease: "power2.in"
      }, "<");
      // Then fade entire splash
      exit.to("#splash", {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      }, "+=0.1");
    }

    enterBtn && enterBtn.addEventListener("click", exitSplash);

    // Scroll or key also exits
    let exited = false;
    const oncePass = (fn) => () => { if (!exited) { exited = true; fn(); } };
    const exitOnce = oncePass(exitSplash);

    window.addEventListener("wheel", exitOnce, { passive: true, once: true });
    window.addEventListener("keydown", (e) => {
      if (["Enter", " ", "ArrowDown", "PageDown"].includes(e.key)) exitOnce();
    }, { once: true });
    window.addEventListener("touchstart", exitOnce, { passive: true, once: true });
  }

  /* =========================================================
     SCROLL REVEALS
     ========================================================= */
  function setupScrollReveals() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Section header titles + nums
    gsap.utils.toArray(".section").forEach((section) => {
      const reveals = section.querySelectorAll("[data-reveal]");
      gsap.fromTo(
        reveals,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true
          }
        }
      );
    });

    // Parallax shimmer on hero bg
    gsap.to(".hero__bg", {
      yPercent: 18,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // Skills cards pop in one-by-one
    gsap.fromTo(
      ".skill",
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
        ease: "power3.out",
        stagger: { each: 0.05, from: "start" },
        scrollTrigger: { trigger: "#skills", start: "top 75%", once: true }
      }
    );

    // Projects rise
    gsap.fromTo(
      ".project",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: "#projects", start: "top 75%", once: true }
      }
    );

    // Timeline items slide-in
    gsap.fromTo(
      ".timeline__item",
      { x: -20, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: "#experience", start: "top 75%", once: true }
      }
    );
  }

  /* =========================================================
     BEHELIT EASTER EGG — Eclipse
     ========================================================= */
  function setupBehelitEasterEgg() {
    const behelit = document.getElementById("behelit");
    const eclipse = document.getElementById("eclipse");
    if (!behelit || !eclipse) return;

    behelit.addEventListener("click", () => {
      eclipse.classList.add("active");
      // Auto-dismiss after a few seconds
      setTimeout(() => {
        eclipse.classList.remove("active");
      }, 4200);
    });

    // Click anywhere on eclipse to dismiss
    eclipse.addEventListener("click", () => eclipse.classList.remove("active"));

    // Konami-style: type "sacrifice" anywhere to trigger
    let buf = "";
    window.addEventListener("keydown", (e) => {
      if (e.key.length === 1) buf = (buf + e.key.toLowerCase()).slice(-9);
      if (buf === "sacrifice") {
        eclipse.classList.add("active");
        setTimeout(() => eclipse.classList.remove("active"), 4200);
        buf = "";
      }
    });
  }
})();
