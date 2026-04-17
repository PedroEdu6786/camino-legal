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
  title: "Camino Legal | Registro de Marca en M\u00e9xico",
  description:
    "Camino Legal te acompa\u00f1a en el registro y protecci\u00f3n de tu marca ante el IMPI. Asesor\u00eda legal especializada en propiedad intelectual para emprendedores y negocios en M\u00e9xico.",
  keywords: [
    "registro de marca",
    "IMPI",
    "propiedad intelectual",
    "marca registrada",
    "M\u00e9xico",
    "Camino Legal",
    "asesor\u00eda legal",
  ],
  openGraph: {
    title: "Camino Legal | Registro de Marca en M\u00e9xico",
    description:
      "Te acompa\u00f1amos en el registro y protecci\u00f3n de tu marca ante el IMPI. Servicio cercano, transparente y profesional.",
    type: "website",
    locale: "es_MX",
    siteName: "Camino Legal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Camino Legal | Registro de Marca en M\u00e9xico",
    description:
      "Te acompa\u00f1amos en el registro y protecci\u00f3n de tu marca ante el IMPI. Servicio cercano, transparente y profesional.",
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
