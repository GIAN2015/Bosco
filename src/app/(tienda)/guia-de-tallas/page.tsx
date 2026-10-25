import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EncabezadoPagina } from "@/components/layout/EncabezadoPagina";
import { obtenerAjustes } from "@/lib/catalogo";
import { enlaceWhatsApp } from "@/lib/precios";

export const metadata: Metadata = {
  title: "Guía de tallas",
  description: "Cómo medir tus polos oversize y croptops BOSQO para elegir tu talla.",
};

const PASOS = [
  ["Ancho de pecho", "Mide de axila a axila en línea recta, sobre una superficie plana."],
  ["Largo total", "Mide desde el punto más alto del hombro (junto al cuello) hasta el borde inferior."],
  ["Ancho de hombros", "Mide de costura de hombro a costura de hombro."],
  ["Largo de manga", "Mide desde la costura del hombro hasta el final de la manga."],
];

export default async function PaginaGuiaTallas() {
  const ajustes = await obtenerAjustes();
  return (
    <>
      <EncabezadoPagina
        titulo="Guía de tallas"
        descripcion="Toma un polo que te quede bien, extiéndelo sobre una superficie plana y compara sus medidas."
      />
      <div className="contenedor space-y-12 py-12">
        <Image
          src="/images/guia-de-tallas.webp"
          alt="Guía visual BOSQO: cómo medir el polo oversize de hombre y el croptop de mujer (ancho de pecho, largo total, ancho de hombros y largo de manga)"
          width={1536}
          height={1024}
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="h-auto w-full border border-linea"
        />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map(([titulo, texto], i) => (
            <li key={titulo} className="space-y-2 border-t border-cacao pt-4">
              <p className="titulo text-sm">
                {i + 1}. {titulo}
              </p>
              <p className="text-sm text-tenue">{texto}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-col items-start gap-4 border border-linea bg-white/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">{ajustes.notaTallas || "¿Dudas con tu talla? Escríbenos y te ayudamos."}</p>
          <div className="flex shrink-0 gap-3">
            <a href={enlaceWhatsApp(ajustes.whatsapp, "Hola BOSQO, necesito ayuda con mi talla")} target="_blank" rel="noopener noreferrer" className="boton">
              Consultar por WhatsApp
            </a>
            <Link href="/tienda" className="boton-borde">
              Ir a la tienda
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
