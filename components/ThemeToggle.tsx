"use client";
import { useSyncExternalStore } from "react";

// The <head> script sets data-theme before first paint (saved choice, else the system setting).
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};
const read = () => document.documentElement.dataset.theme === "dark";

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, read, () => false);
  const flip = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  return (
    <button type="button" className="theme" role="switch" aria-checked={dark} aria-label="Night mode" onClick={flip}>
      <span className="theme-knob" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="theme-sun">
          <circle cx="12" cy="12" r="4.2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.6" x2="12" y2="5" transform={`rotate(${a} 12 12)`} />
          ))}
        </svg>
        <svg viewBox="0 0 24 24" className="theme-moon">
          <path d="M15.5 3.5a8.5 8.5 0 1 0 5 13.4A7 7 0 0 1 15.5 3.5Z" />
        </svg>
      </span>
    </button>
  );
}
