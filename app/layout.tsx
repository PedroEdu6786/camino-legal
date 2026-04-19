import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import CustomCursor from "./components/ui/CustomCursor";
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
      lang="en"
      className={`${poppins.variable} ${dmSans.variable} ${bellaboo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col md:cursor-none">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
