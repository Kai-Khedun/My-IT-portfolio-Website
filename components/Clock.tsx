"use client";
import { useSyncExternalStore } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Johannesburg",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const subscribe = (tick: () => void) => {
  const id = setInterval(tick, 15000);
  return () => clearInterval(id);
};

/** Live Durban time. Server render shows --:-- so the static HTML never carries a stale time. */
export function Clock() {
  return useSyncExternalStore(subscribe, () => fmt.format(new Date()), () => "--:--");
}
