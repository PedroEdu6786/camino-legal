"use client";

import Image from "next/image";
import { useId } from "react";
import { StickerInkFilter } from "./StickerInk";

export default function ProcessSticker({ file }: { file: string }) {
  const filterId = `process-ink-${useId().replace(/:/g, "")}`;
  const src = `/stickers/${file}`;

  return (
    <span className="process-step-art w-16 h-16 md:w-36 md:h-36 lg:w-40 lg:h-40 shrink-0 -rotate-6" aria-hidden="true">
      <svg className="process-step-ink w-full h-full" viewBox="0 0 240 240" focusable="false">
        <defs><StickerInkFilter id={filterId} /></defs>
        <image href={src} width="240" height="240" preserveAspectRatio="xMidYMid meet" filter={`url(#${filterId})`} />
      </svg>
      <Image src={src} alt="" width={240} height={240} className="process-step-original w-full h-full object-contain" />
    </span>
  );
}
