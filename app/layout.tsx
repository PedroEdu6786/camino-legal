import { editableColors } from "./color-lab/themes";
import ThemePreviewControls from "./components/ui/ThemePreviewControls";
import DisclosureMotion from "./components/ui/DisclosureMotion";
import type { Metadata } from "next";
import { Suspense } from "react";
import PublicSiteChrome from "./components/layout/PublicSiteChrome";
import { Poppins, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import StickerInk from "./components/ui/StickerInk";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const bellaboo = localFont({
  src: "../public/fonts/Bellaboo.otf",
  variable: "--font-bellaboo",
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: "/favicon-terracota.ico",
  },
  title: "Camino Legal\u00ae / Protecci\u00f3n de Marcas y Propiedad Intelectual en M\u00e9xico",
  description:
    "Camino Legal ofrece registro de marca ante el IMPI, contratos y convenios, derechos de autor, t\u00e9rminos y condiciones, avisos de privacidad y asesor\u00eda legal personalizada para emprendedores y negocios en M\u00e9xico.",
  keywords: [
    "registro de marca",
    "IMPI",
    "propiedad intelectual",
    "marca registrada",
    "derechos de autor",
    "INDAUTOR",
    "contratos y convenios",
    "acuerdo de confidencialidad",
    "t\u00e9rminos y condiciones",
    "aviso de privacidad",
    "protecci\u00f3n de datos",
    "asesor\u00eda legal",
    "M\u00e9xico",
    "Camino Legal",
  ],
  openGraph: {
    title: "Camino Legal\u00ae / Protecci\u00f3n de Marcas y Propiedad Intelectual en M\u00e9xico",
    description:
      "Registro de marca, derechos de autor, contratos, t\u00e9rminos y condiciones, aviso de privacidad y asesor\u00eda legal. Protecci\u00f3n jur\u00eddica integral para tu negocio en M\u00e9xico.",
    type: "website",
    locale: "es_MX",
    siteName: "Camino Legal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Camino Legal\u00ae / Protecci\u00f3n de Marcas y Propiedad Intelectual en M\u00e9xico",
    description:
      "Registro de marca, derechos de autor, contratos, t\u00e9rminos y condiciones, aviso de privacidad y asesor\u00eda legal. Protecci\u00f3n jur\u00eddica integral para tu negocio en M\u00e9xico.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${poppins.variable} ${dmSans.variable} ${bellaboo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">{`try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`}</Script>

        <Script id="site-color-preview" strategy="beforeInteractive">{`try {
          const keys = ${JSON.stringify(editableColors.map(({key}) => key))};
          const query = new URLSearchParams(location.search);
          const storageKey = 'camino-site-preview';
          const read = values => Object.fromEntries(keys.filter(key => typeof values?.[key] === 'string' && /^#[0-9a-f]{6}$/i.test(values[key])).map(key => [key, values[key]]));
          let saved = null;
          try { saved = sessionStorage.getItem(storageKey); } catch {}
          if (query.get('preview') === 'original') {
            saved = null;
            try { sessionStorage.removeItem(storageKey); } catch {}
          } else if (query.get('preview') === 'custom') {
            saved = JSON.stringify(read(Object.fromEntries(query)));
            try { sessionStorage.setItem(storageKey, saved); } catch {}
            document.documentElement.classList.remove('dark');
          }
          if (saved && location.pathname !== '/color-lab') {
            document.documentElement.classList.remove('dark');
            const colors = read(JSON.parse(saved));
            document.documentElement.dataset.sitePreview = 'true';
            for (const [key, value] of Object.entries(colors)) {
              document.documentElement.style.setProperty('--lab-' + key, value);
              document.documentElement.setAttribute('data-lab-' + key.toLowerCase(), 'true');
            }
          }
        } catch {}`}</Script>
        <StickerInk />
        <DisclosureMotion />
        <Suspense fallback={null}><PublicSiteChrome /></Suspense>
        {children}
        <ThemePreviewControls />
      </body>
    </html>
  );
}
