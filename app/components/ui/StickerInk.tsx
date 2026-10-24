/** Convert the original sticker ink to orange and remove its pale paper backing. */
export function StickerInkFilter({ id }: { id: string }) {
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0.796078
                0 0 0 0 0.329412
                0 0 0 0 0.196078
                -0.213 -0.715 -0.072 0 1"
      />
      <feComponentTransfer>
        <feFuncA type="linear" slope="2" intercept="-0.5" />
      </feComponentTransfer>
      <feComposite in2="SourceAlpha" operator="in" />
    </filter>
  );
}

/** Separate ink mask so hero recoloring never changes service illustrations. */
export function HeroIconFilter({ id, color }: { id: string; color?: string }) {
  return <filter id={id} colorInterpolationFilters="sRGB">
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.213 -0.715 -0.072 0 1" />
    <feComponentTransfer><feFuncA type="linear" slope="2" intercept="-0.5" /></feComponentTransfer>
    <feComposite in2="SourceAlpha" operator="in" result="ink" />
    <feFlood floodColor={color} style={color ? undefined : { floodColor: "var(--lab-heroIcons, #CB5432)" }} />
    <feComposite in2="ink" operator="in" />
  </filter>;
}

export default function StickerInk() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute pointer-events-none">
      <defs><StickerInkFilter id="camino-sticker-ink" /><HeroIconFilter id="camino-hero-ink" /><HeroIconFilter id="camino-route-ink" color="#B37560" /></defs>
    </svg>
  );
}
