/** A responsive hidden variant must never own an impression's visibility timer. */
export function representativeTarget(owner: Element, viewportHeight: number, rendered: (element: Element) => boolean): Element | null {
  if (!rendered(owner)) return null;
  if (owner.getBoundingClientRect().height <= viewportHeight) return owner;
  return Array.from(owner.querySelectorAll("p,li,input")).find(candidate =>
    candidate.closest("[data-analytics-section],[data-analytics-step],[data-analytics-form],[data-analytics-quote]") === owner &&
    rendered(candidate) && candidate.getBoundingClientRect().height <= viewportHeight,
  ) || owner;
}
