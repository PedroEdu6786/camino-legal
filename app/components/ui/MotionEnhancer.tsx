"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const targets = [
  "[data-reveal]",
  ".site-main h2",
  ".site-main .content-list > li",
  ".site-main .process-columns > li",
  ".site-main .cost-band",
  ".site-main .faq-section details",
].join(",");

/** Animate visible content once; nothing depends on JavaScript to be readable. */
export default function MotionEnhancer() {
  const pathname = usePathname();
  const seen = useRef(new WeakSet<Element>());

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const registered = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      let stagger = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        seen.current.add(entry.target);
        if (preference.matches) continue;
        const element = entry.target as HTMLElement;
        const isCard = element.matches("[data-reveal='card'], .process-columns > li");
        const opacity = getComputedStyle(element).opacity;
        const animation = element.animate([
          { opacity: 0, translate: isCard ? "0 22px" : "0 14px" },
          { opacity, translate: "0 0" },
        ], {
          duration: isCard ? 600 : 480,
          delay: Math.min(stagger++ * 65, 195),
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "backwards",
        });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0, rootMargin: "0px 0px 48px 0px" });

    const register = (root: ParentNode) => {
      const elements = [...root.querySelectorAll(targets)];
      if (root instanceof Element && root.matches(targets)) elements.push(root);
      for (const element of elements) {
        if (seen.current.has(element) || registered.has(element) || element.closest(".quote-sheet")) continue;
        if (element.parentElement?.closest("[data-reveal]")) continue;
        // The investment panel enters together; do not animate its heading twice.
        if (element.closest(".cost-band") && !element.matches(".cost-band")) continue;
        registered.add(element);
        // Hydration and route changes may register content after it has painted.
        // Never hide already-visible content to replay an entrance animation.
        if (element.getBoundingClientRect().top < window.innerHeight) {
          seen.current.add(element);
          continue;
        }
        observer.observe(element);
      }
    };
    register(document);
    const mutations = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node instanceof Element) register(node);
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    const stopMotion = () => {
      if (preference.matches) {
        for (const animation of animations) animation.cancel();
        animations.clear();
      }
    };
    preference.addEventListener("change", stopMotion);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      preference.removeEventListener("change", stopMotion);
      for (const animation of animations) animation.cancel();
    };
  }, [pathname]);

  return null;
}
