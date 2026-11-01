"use client";

import { useLayoutEffect, useRef } from "react";

export default function BackgroundCurves() {
  const frame = useRef<HTMLDivElement>(null);
  const artwork = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const container = frame.current;
    const svg = artwork.current;
    if (!container || !svg) return;

    let width = -1;
    const sizeArtwork = () => {
      // Capture this page's composition on mount and responsive width changes.
      // Height-only changes (disclosures, tabs, etc.) must not rescale the paths.
      if (container.clientWidth === width) return;
      width = container.clientWidth;
      svg.style.height = `${container.clientHeight}px`;
    };
    sizeArtwork();
    const observer = new ResizeObserver(sizeArtwork);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
    <svg
      ref={artwork}
      className="absolute top-0 left-0 w-full h-full"
      viewBox="0 0 1200 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        d="M-100 300 C200 100, 400 500, 700 250 S1100 400, 1400 200"
        stroke="var(--curve)"
        strokeWidth="1.5"
        opacity="0.12"
      />
      <path
        d="M-50 500 C150 350, 450 650, 750 400 S1050 550, 1350 350"
        stroke="var(--curve)"
        strokeWidth="1"
        opacity="0.12"
      />
      <path
        d="M-200 150 C100 50, 350 300, 600 150 S900 250, 1300 100"
        stroke="var(--curve)"
        strokeWidth="2"
        opacity="0.12"
      />
      <path
        d="M0 650 C300 500, 500 750, 800 600 S1100 700, 1400 550"
        stroke="var(--curve)"
        strokeWidth="1"
        opacity="0.12"
      />
      <path
        d="M-150 450 C100 300, 350 550, 650 350 S950 500, 1300 300"
        stroke="var(--curve)"
        strokeWidth="1.5"
        opacity="0.12"
      />
    </svg>
    </div>
  );
}
