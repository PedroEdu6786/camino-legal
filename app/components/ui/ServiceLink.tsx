"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/** Service details always start at the top on a new link navigation. */
export default function ServiceLink(props: Omit<ComponentProps<typeof Link>, "scroll" | "onNavigate">) {
  return <Link {...props} scroll={false} onNavigate={() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }} />;
}
