"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavPill({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const pill = pillRef.current;
    if (!container || !pill) return;

    const update = () => {
      const active = container.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
      if (!active || !container.getClientRects().length) {
        pill.style.opacity = "0";
        return;
      }

      const bounds = container.getBoundingClientRect();
      const target = active.getBoundingClientRect();
      pill.style.transform = `translate(${target.left - bounds.left}px, ${target.top - bounds.top}px)`;
      pill.style.width = `${target.width}px`;
      pill.style.height = `${target.height}px`;
      pill.style.opacity = "1";
      if (!pill.dataset.ready) {
        // Commit the starting geometry before enabling transitions.
        pill.getBoundingClientRect();
        pill.dataset.ready = "true";
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    container.querySelectorAll("a").forEach(link => observer.observe(link));
    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <div ref={containerRef} className="camino-nav-track hidden lg:flex items-center gap-8 lg:gap-12">
      <span ref={pillRef} aria-hidden="true" className="camino-nav-pill" />
      {children}
    </div>
  );
}
