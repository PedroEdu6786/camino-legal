"use client";

import { useEffect, useRef, type ReactNode } from "react";

const FOLLOW_EASING_MS = 320;

/** Follow scroll position smoothly, catching up in the same time even after large jumps. */
export default function TrademarkRoute({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const inkRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const list = listRef.current;
    const svg = svgRef.current;
    const track = trackRef.current;
    const ink = inkRef.current;
    const marker = markerRef.current;
    if (!root || !list || !svg || !track || !ink || !marker) return;
    const rows = [...list.children] as HTMLLIElement[];
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let frame = 0;
    let length = 0;
    let boundaries: number[] = [];
    let stepPositions: number[] = [];
    let position = 0;
    let lastTime = 0;

    const paint = (time: number) => {
      frame = 0;
      if (!length || disposed) return;
      const box = root.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight * .55 - box.top) / box.height));
      const target = preference.matches ? length : progress * length;
      // Use actual elapsed time so dropped frames do not prolong the catch-up.
      const elapsed = lastTime ? Math.max(0, time - lastTime) : 16;
      lastTime = time;
      const onScreen = box.top < window.innerHeight && box.bottom > 0;
      const difference = target - position;
      const eased = difference * (1 - Math.exp(-elapsed / FOLLOW_EASING_MS));
      // A fixed pixel-speed cap can leave the marker several screens behind.
      // Distance-based easing closes large gaps without queuing the skipped route.
      position = preference.matches || !onScreen ? target : position + eased;
      if (Math.abs(target - position) < .3) position = target;
      ink.style.strokeDashoffset = String(1 - position / length);
      const point = track.getPointAtLength(position);
      const ahead = track.getPointAtLength(Math.min(position + 2, length));
      const behind = track.getPointAtLength(Math.max(position - 2, 0));
      const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
      marker.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
      marker.style.opacity = !preference.matches && onScreen ? "1" : "0";
      rows.forEach((row, index) => {
        row.dataset.reached = String(preference.matches || position >= stepPositions[index]);
      });
      root.dataset.motion = position === target ? "idle" : "following";
      if (position !== target) frame = requestAnimationFrame(paint);
      else lastTime = 0;
    };
    const schedule = () => {
      if (!frame) { lastTime = 0; frame = requestAnimationFrame(paint); }
    };
    const measure = () => {
      if (disposed) return;
      const width = root.clientWidth;
      const height = list.offsetHeight;
      const edge = 3;
      const radius = Math.min(width * .13, 110);
      let path = `M ${edge + radius} 1 H ${width - edge - radius} Q ${width - edge} 1 ${width - edge} ${radius}`;
      boundaries = [0];
      rows.forEach((row, index) => {
        const bottom = row.offsetTop + row.offsetHeight - 1;
        const right = index % 2 === 0;
        const side = right ? width - edge : edge;
        const end = right ? edge + radius : width - edge - radius;
        path += ` V ${bottom - radius} Q ${side} ${bottom} ${right ? side - radius : side + radius} ${bottom} H ${end}`;
        track.setAttribute("d", path);
        boundaries.push(track.getTotalLength());
        if (index < rows.length - 1) {
          const nextSide = right ? edge : width - edge;
          path += ` Q ${nextSide} ${bottom} ${nextSide} ${bottom + radius}`;
        }
      });
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      ink.setAttribute("d", path);
      length = boundaries[boundaries.length - 1];
      // Labels sit halfway along each horizontal run, rather than at its start.
      stepPositions = rows.map((_, index) => index === 0
        ? width / 2 - edge - radius
        : boundaries[index] - Math.abs(width / 2 - (index % 2 === 1 ? edge + radius : width - edge - radius)));
      position = Math.min(position, length);
      root.dataset.measured = "true";
      cancelAnimationFrame(frame);
      paint(performance.now());
    };
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    preference.addEventListener("change", measure);
    document.fonts.ready.then(measure);
    measure();
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      preference.removeEventListener("change", measure);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="trademark-route-track" ref={rootRef}>
      <svg className="trademark-route-drawing" ref={svgRef} aria-hidden="true" preserveAspectRatio="none">
        <path ref={trackRef} className="trademark-route-base" />
        <path ref={inkRef} className="trademark-route-ink" pathLength="1" />
        <g ref={markerRef} className="trademark-route-marker"><path d="M -12 -8 L 13 0 L -12 8 L -6 0 Z" /></g>
      </svg>
      <ol className="trademark-timeline" ref={listRef}>{children}</ol>
    </div>
  );
}
