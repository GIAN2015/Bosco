import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { obtenerAjustes } from "@/lib/catalogo";
import { URL_SITIO } from "@/lib/sitio";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  // La vista previa al compartir el enlace (WhatsApp, Facebook) usa la primera imagen del carrusel
  const { portada } = await obtenerAjustes();
  return {
    metadataBase: new URL(URL_SITIO),
    title: {
      default: "BOSQO · Moda contemporánea",
      template: "%s · BOSQO",
    },
    description:
      "Polos oversize y croptops inspirados en la Costa, los Andes y la Selva del Perú. Nuestro origen es estilo.",
    openGraph: {
      type: "website",
      locale: "es_PE",
      siteName: "BOSQO",
      images: portada.slice(0, 1).map((d) => d.imagen),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f6eee4",
};

const INTRO_UNA_VEZ = `try{if(sessionStorage.getItem("bosqo-intro"))document.documentElement.dataset.intro="vista";else sessionStorage.setItem("bosqo-intro","1")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: el script de abajo añade data-intro a <html> antes de que React hidrate
    <html
      lang="es"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Corre antes de pintar: la pantalla de carga solo se ve en la primera visita de la sesión */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_UNA_VEZ }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
