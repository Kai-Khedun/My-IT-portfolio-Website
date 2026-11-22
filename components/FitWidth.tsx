"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Renders children at a fixed width and scales them down to fit the parent box. */
export function FitWidth({ width, children }: { width: number; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const fit = () => el.style.setProperty("--s", (box.clientWidth / width).toFixed(4));
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [width]);
  return (
    <span ref={ref} className="fit" style={{ width }} aria-hidden="true">
      {children}
    </span>
  );
}
