"use client";

import { useEffect } from "react";
import { trackEvent } from "../../lib/analytics";

const SECTION_IDS = ["services", "process", "about", "reviews", "faq", "contact"];

export default function SectionViewTracker() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            trackEvent("section_view", { section: entry.target.id });
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 },
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
