"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Geometry = { top: number; height: number; travel: number };

export function useScrollJourney(track: RefObject<HTMLDivElement | null>, stage: RefObject<HTMLDivElement | null>, count: number, onStep: (step: number) => void) {
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const current = useRef<Geometry | null>(null);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const updateStep = () => {
      const layout = current.current;
      if (!layout || !track.current) return;
      const distance = layout.top - track.current.getBoundingClientRect().top;
      onStep(Math.max(0, Math.min(count - 1, Math.floor(distance / layout.travel * count))));
    };
    const onScroll = updateStep;
    const measure = () => {
      if (!stage.current) return;
      const headerBottom = (document.querySelector("header")?.getBoundingClientRect().height ?? 72) + 16;
      const height = Math.ceil(stage.current.getBoundingClientRect().height);
      const bottomSpace = innerWidth < 1024 ? 76 : 16;
      const top = headerBottom + Math.max(0, (innerHeight - headerBottom - bottomSpace - height) / 2);
      const next = height > 0 && !preference.matches && height + headerBottom + bottomSpace <= innerHeight
        ? { top, height, travel: Math.max(420, innerHeight * .6) * (count - 1) }
        : null;
      current.current = next;
      setGeometry(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
      if (next) onScroll();
    };
    const observer = new ResizeObserver(measure);
    if (stage.current) observer.observe(stage.current);
    const header = document.querySelector("header");
    if (header) observer.observe(header);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    preference.addEventListener("change", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      preference.removeEventListener("change", measure);
    };
  }, [track, stage, count, onStep]);

  const jumpTo = (index: number) => {
    const layout = current.current;
    if (layout && track.current) {
      const start = track.current.getBoundingClientRect().top + scrollY - layout.top;
      window.scrollTo({ top: start + (index + .15) / count * layout.travel, behavior: "smooth" });
      // Select steps as the scroll reaches them, avoiding a destination-first flash.
      return;
    }
    onStep(index);
  };
  return { geometry, jumpTo };
}
