/** Animate disclosure height while retaining native summary and toggle semantics. */
export function installDisclosureMotion() {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Map<HTMLDetailsElement, Animation>();
  const frames = new Map<HTMLDetailsElement, number>();
  const closing = new Set<HTMLDetailsElement>();

  const cancel = (details: HTMLDetailsElement) => {
    const frame = frames.get(details);
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frames.delete(details);
    animations.get(details)?.cancel();
    animations.delete(details);
    closing.delete(details);
  };

  const animate = (details: HTMLDetailsElement, from: number, to: number, close = false) => {
    if (close) closing.add(details);
    const animation = details.animate([
      // `clip` masks the content without creating a new formatting context.
      // `hidden` can change margin layout after the destination was measured.
      { height: `${from}px`, overflow: "clip" },
      { height: `${to}px`, overflow: "clip" },
    ], { duration: 360, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "both" });
    animations.set(details, animation);
    animation.onfinish = () => {
      if (animations.get(details) !== animation) return;
      if (close) details.open = false;
      cancel(details);
    };
  };

  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const summary = event.target.closest("summary");
    const details = summary?.parentElement;
    if (!summary || !(details instanceof HTMLDetailsElement)) return;
    // Links or buttons within a summary keep their own default action.
    if (event.target.closest("a, button, input, select, textarea")) return;
    const from = details.getBoundingClientRect().height;
    const wasClosing = closing.has(details);
    cancel(details);
    if (preference.matches) return;

    if (details.open) {
      // Delay native hiding until the shrinking content has finished painting.
      event.preventDefault();
      if (wasClosing) {
        animate(details, from, details.getBoundingClientRect().height);
      } else {
        const style = window.getComputedStyle(details);
        const summaryStyle = window.getComputedStyle(summary);
        const pixels = (value: string) => parseFloat(value) || 0;
        const to = summary.getBoundingClientRect().height
          + pixels(summaryStyle.marginTop) + pixels(summaryStyle.marginBottom)
          + pixels(style.paddingTop) + pixels(style.paddingBottom)
          + pixels(style.borderTopWidth) + pixels(style.borderBottomWidth);
        animate(details, from, to, true);
      }
      return;
    }

    // The native click (including Enter/Space) toggles `open` before this frame.
    // Measure and animate before the browser paints the expanded content.
    frames.set(details, window.requestAnimationFrame(() => {
      frames.delete(details);
      if (event.defaultPrevented || !details.isConnected || !details.open || preference.matches) return;
      const to = details.getBoundingClientRect().height;
      if (to <= from) return;
      animate(details, from, to);
    }));
  };

  const onToggle = (event: Event) => {
    // Native named accordions can close another item without clicking it.
    if (event.target instanceof HTMLDetailsElement && !event.target.open) cancel(event.target);
  };
  const stop = () => {
    for (const details of new Set([...frames.keys(), ...animations.keys()])) {
      if (closing.has(details)) details.open = false;
      cancel(details);
    }
  };
  const onPreference = () => { if (preference.matches) stop(); };
  document.addEventListener("click", onClick, true);
  document.addEventListener("toggle", onToggle, true);
  preference.addEventListener("change", onPreference);
  return () => {
    stop();
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("toggle", onToggle, true);
    preference.removeEventListener("change", onPreference);
  };
}
