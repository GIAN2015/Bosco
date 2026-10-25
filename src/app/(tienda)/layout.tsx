import { IconoWhatsApp } from "@/components/Iconos";
import { Cabecera } from "@/components/layout/Cabecera";
import { PantallaCarga } from "@/components/layout/PantallaCarga";
import { Pie } from "@/components/layout/Pie";
import { obtenerAjustes } from "@/lib/catalogo";
import { enlaceWhatsApp } from "@/lib/precios";

export default async function LayoutTienda({ children }: LayoutProps<"/">) {
  const ajustes = await obtenerAjustes();
  const consulta = enlaceWhatsApp(ajustes.whatsapp, "Hola BOSQO, tengo una consulta");
  return (
    <>
      <PantallaCarga />
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-cacao focus:px-4 focus:py-2 focus:text-crema">
        Saltar al contenido
      </a>
      <Cabecera anuncio={ajustes.anuncio || undefined} whatsapp={consulta} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Pie ajustes={ajustes} />
      <a
        href={consulta}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform duration-500 ease-calida hover:-translate-y-1 hover:scale-105"
      >
        <IconoWhatsApp className="size-7" />
      </a>
    </>
  );
}
