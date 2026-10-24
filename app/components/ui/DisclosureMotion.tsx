"use client";

import { useEffect } from "react";
import { installDisclosureMotion } from "../../lib/disclosureMotion";

export default function DisclosureMotion() {
  useEffect(installDisclosureMotion, []);
  return null;
}
