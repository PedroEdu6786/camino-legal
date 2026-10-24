import type { Metadata } from "next";
import ColorLab from "./ColorLab";
import { readOverrides } from "./themes";

export const metadata: Metadata = {
  title: "Explorador de temas v2 | Camino Legal",
  robots: { index: false, follow: false },
};

export default async function ColorLabPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialEditable = params.theme === "linen-custom";
  const initialCompare = params.compare === "linen";
  const initialOverrides = readOverrides(params);
  return <ColorLab initialEditable={initialEditable} initialCompare={initialCompare} initialOverrides={initialOverrides} />;
}
